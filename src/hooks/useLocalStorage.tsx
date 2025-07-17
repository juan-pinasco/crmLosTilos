import { useState, useEffect } from 'react';

/**
 * Hook personalizado para persistir estado en localStorage
 * @param key Clave para guardar en localStorage
 * @param initialValue Valor inicial (puede ser un valor o una función que devuelva un valor)
 * @returns [storedValue, setValue] - Estado y función para actualizarlo
 */
export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  // Estado para almacenar nuestro valor
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Obtener de localStorage por clave
      const item = window.localStorage.getItem(key);
      
      // Analizar el elemento almacenado o devolver el valor inicial
      if (item) {
        return JSON.parse(item);
      }
      
      // Si no existe valor en localStorage, usar el valor inicial
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      // En caso de error, usar el valor inicial
      console.error(`Error al recuperar ${key} de localStorage:`, error);
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
      
      // Guardar en localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error al guardar ${key} en localStorage:`, error);
    }
  };
  
  // Actualizar localStorage si la clave cambia
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error al actualizar ${key} en localStorage:`, error);
    }
  }, [key, storedValue]);
  
  return [storedValue, setValue] as const;
}
