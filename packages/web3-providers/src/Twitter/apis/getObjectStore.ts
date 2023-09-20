import { Sniffings } from '@masknet/shared-base'

/* cspell:disable-next-line */
const DB_NAME = 'localforage'
const DB_VERSION = 2

async function getDatabase() {
    if (!Sniffings.is_firefox) {
        const databases = await indexedDB.databases()
        if (!databases.some((x) => x.name === DB_NAME && x.version === DB_VERSION)) return
    }

    return new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)

        request.addEventListener('success', () => {
            resolve(request.result)
        })
        request.addEventListener('error', (error) => {
            reject(error)
        })
    })
}

export async function getObjectStore(name: string) {
    const database = await getDatabase()
    if (!database) throw new Error('Failed to read database.')

    const transaction = database.transaction([name], 'readonly')
    return transaction.objectStore(name)
}
