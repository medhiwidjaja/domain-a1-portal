/**
 * Target Architecture: IndexedDB Local Storage Service
 * Persists Domain A1 Pelaku Usaha state across browser reloads:
 * - Company Profiles & Legal Entities (BUSINESS_ENTITY)
 * - Virtual Filing Cabinet Documents (VFC_DOCUMENT) & Custom Folders
 * - Spatial Parcel Site Library (SPATIAL_PARCEL_ASSET)
 * - Permit Applications & Wizard Drafts (APPLICATION_DRAFT)
 */

const DB_NAME = 'oss_v2_domain_a1_db';
const DB_VERSION = 1;

export const STORES = {
  COMPANIES: 'company_entities',
  VFC_DOCS: 'vfc_documents',
  VFC_CATEGORIES: 'vfc_custom_categories',
  SPATIAL_PARCELS: 'spatial_parcel_assets',
  PERMITS: 'permit_applications',
  APP_STATE: 'app_state'
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let dbInstance: IDBDatabase | null = null;

export async function getDb(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Company Master Entities
      if (!db.objectStoreNames.contains(STORES.COMPANIES)) {
        db.createObjectStore(STORES.COMPANIES, { keyPath: 'id' });
      }

      // 2. VFC Documents
      if (!db.objectStoreNames.contains(STORES.VFC_DOCS)) {
        const store = db.createObjectStore(STORES.VFC_DOCS, { keyPath: 'id' });
        store.createIndex('by_company', 'companyId', { unique: false });
        store.createIndex('by_category', ['companyId', 'category'], { unique: false });
      }

      // 3. VFC Custom Folders
      if (!db.objectStoreNames.contains(STORES.VFC_CATEGORIES)) {
        db.createObjectStore(STORES.VFC_CATEGORIES, { keyPath: 'key' });
      }

      // 4. Spatial Parcel Asset Library (SPATIAL_PARCEL_ASSET)
      if (!db.objectStoreNames.contains(STORES.SPATIAL_PARCELS)) {
        const store = db.createObjectStore(STORES.SPATIAL_PARCELS, { keyPath: 'parcel_id' });
        store.createIndex('by_company', 'company_id', { unique: false });
      }

      // 5. Permit Applications (APPLICATION_DRAFT & Submitted)
      if (!db.objectStoreNames.contains(STORES.PERMITS)) {
        const store = db.createObjectStore(STORES.PERMITS, { keyPath: 'id' });
        store.createIndex('by_company', 'companyId', { unique: false });
      }

      // 6. Generic App State (activeCompanyId, activeWizard draft, etc.)
      if (!db.objectStoreNames.contains(STORES.APP_STATE)) {
        db.createObjectStore(STORES.APP_STATE, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

/**
 * Put an item into a specified store
 */
export async function idbPut<T>(storeName: StoreName, value: T): Promise<T> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(value);
    req.onsuccess = () => resolve(value);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get an item by its primary key
 */
export async function idbGet<T>(storeName: StoreName, key: IDBValidKey): Promise<T | undefined> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result as T | undefined);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Get all items from a store
 */
export async function idbGetAll<T>(storeName: StoreName): Promise<T[]> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result as T[]);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Bulk put items into a store
 */
export async function idbPutAll<T>(storeName: StoreName, items: T[]): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    for (const item of items) {
      store.put(item);
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Delete an item by its primary key
 */
export async function idbDelete(storeName: StoreName, key: IDBValidKey): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Clear all records in a store
 */
export async function idbClear(storeName: StoreName): Promise<void> {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

/**
 * Generic key-value state helpers for app_state
 */
export async function setAppState<T>(key: string, value: T): Promise<void> {
  await idbPut(STORES.APP_STATE, { key, value, updatedAt: new Date().toISOString() });
}

export async function getAppState<T>(key: string): Promise<T | undefined> {
  const record = await idbGet<{ key: string; value: T }>(STORES.APP_STATE, key);
  return record?.value;
}
