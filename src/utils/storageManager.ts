// Utilidades centralizadas para gestionar el acceso a localStorage y
// notificar a los componentes cuando se limpian las claves de la sesión.
// Todas las operaciones de escritura/borrado de localStorage deben pasar por aquí.

export const STORAGE_CLEARED_EVENT = 'storage:cleared';

/** Guarda un valor en localStorage. */
export function setItem<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`storageManager.setItem: no se pudo guardar ${key}`, error);
  }
}

/** Elimina una clave concreta de localStorage. */
export function removeItem(key: string) {
  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.error(`storageManager.removeItem: no se pudo eliminar ${key}`, error);
  }
}

/**
 * Borra todas las claves relacionadas con filtros/tabla al cerrar sesión y
 * emite un CustomEvent para que los componentes reactivos limpien su estado
 * y no vuelvan a escribirlas.
 */
export async function clearOnLogout() {
  const keys = Object.keys(window.localStorage);
  const removedKeys: string[] = [];

  const patterns = [
    'clientesHome_filtros',
    'clientesTable_',
    'eventosTable_',
    'filter',
    'sort',
    'page',
    'cliente',
    'search',
    'columns',
    'vendedor',
  ];

  keys.forEach((key) => {
    if (patterns.some((p) => key.includes(p))) {
      removeItem(key);
      removedKeys.push(key);
    }
  });

  // Notificar a la aplicación qué claves fueron eliminadas
  if (removedKeys.length) {
    const evt = new CustomEvent(STORAGE_CLEARED_EVENT, { detail: { keys: removedKeys } });
    window.dispatchEvent(evt);
  }
}
