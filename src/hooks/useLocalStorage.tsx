import { useState, useEffect, useRef } from 'react';
import { setItem as smSetItem, STORAGE_CLEARED_EVENT } from '../utils/storageManager';

/**
 * Hook personalizado para persistir estado en localStorage
 * @param key Clave para guardar en localStorage
 * @param initialValue Valor inicial (puede ser un valor o una función que devuelva un valor)
 * @returns [storedValue, setValue] - Estado y función para actualizarlo
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  // Ref para saber si la clave fue eliminada mediante clearOnLogout
  const clearedRef = useRef(false);
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener de localStorage por clave
      const item = window.localStorage.getItem(key);
      
      // Analizar el elemento almacenado o devolver el valor inicial
      if (item) {
        try {
          const parsed = JSON.parse(item);
          if (parsed !== null && parsed !== undefined) return parsed;
        } catch {
          // si falla el parseo, más abajo se devolverá initialValue
        }
      }
      
      // Si no existe valor en localStorage, usar el valor inicial
      // Valor por defecto seguro
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      // En caso de error, usar el valor inicial
      console.error(`Error al recuperar ${key} de localStorage:`, error);
      // Valor por defecto seguro
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });
  
  // Función para actualizar el estado y localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permitir que el valor sea una función (como en useState)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Guardar en el estado
      setStoredValue(valueToStore);
      
      // Guardar en localStorage mediante storageManager
      smSetItem(key, valueToStore);
      // Si alguna vez se había marcado como "limpiado", volvemos a habilitar la escritura
      clearedRef.current = false;
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error);
    }
  };
  
  // Actualizar localStorage si la clave cambia (solo si no se limpió recientemente)
  useEffect(() => {
    try {
      if (!clearedRef.current) {
        smSetItem(key, storedValue);
      }
    } catch (error) {
      console.error(`Error al actualizar ${key} en localStorage:`, error);
    }
  }, [key, storedValue]);
  
  // Suscribirse a los eventos de limpieza
  useEffect(() => {
    const handler = (e: Event) => {
      const detailKeys = (e as CustomEvent).detail?.keys as string[] | undefined;
      if (detailKeys && detailKeys.includes(key)) {
        clearedRef.current = true;
        setStoredValue(initialValue instanceof Function ? initialValue() : initialValue);
      }
    };
    window.addEventListener(STORAGE_CLEARED_EVENT, handler);
    return () => window.removeEventListener(STORAGE_CLEARED_EVENT, handler);
  }, [key]);

  return [storedValue, setValue] as const;
}
