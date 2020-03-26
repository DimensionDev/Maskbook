import { Page } from 'puppeteer'

export function clean(page: Page, dbName: string, storeName: string) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName)

        request.onsuccess = () => {
            const db = request.result
            const tx = db.transaction([storeName], 'readwrite')
            tx.oncomplete = resolve
            tx.onerror = reject

            const store = tx.objectStore(storeName)
            store.clear()
        }
    })
}
