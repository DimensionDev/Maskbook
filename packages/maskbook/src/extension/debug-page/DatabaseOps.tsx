import { openDB, wrap } from 'idb/with-async-ittr'
import type { BackupFormat, Instance, ObjectStore } from './types'
import typeson from './typeson'

export const DatabaseOps: React.FC = () => {
    const onBackup = async () => {
        const payload = await backupAll()
        if (payload === undefined) {
            return
        }
        const timestamp = ((value: Date) => {
            const values = [
                value.getUTCFullYear(),
                value.getUTCMonth() + 1,
                value.getUTCDate(),
                value.getUTCHours(),
                value.getUTCMinutes(),
                value.getUTCSeconds(),
            ]
            return values.map((value) => value.toString().padStart(2, '0')).join('')
        })(new Date())
        download(`masknetwork-dump-${timestamp}.json`, payload)
    }
    const onRestore = async () => {
        const file = await select()
        if (file === undefined) {
            return
        }
        const parsed: BackupFormat = await typeson.parse(await file.text())
        await restoreAll(parsed)
    }
    const onClear = async () => {
        const databases = await indexedDB.databases?.()
        if (databases === undefined) {
            return
        }
        await Promise.all(
            databases.map(async ({ name }) => {
                await timeout(wrap(indexedDB.deleteDatabase(name)), 500)
            }),
        )
    }
    return (
        <section>
            <p>
                <button onClick={onBackup}>Backup Database</button>
            </p>
            <p>
                <button onClick={onRestore}>Overwrite Database with backup</button>
            </p>
            <p>
                <button onClick={onClear}>Clear Database</button>
            </p>
        </section>
    )
}

function select() {
    return new Promise<File | undefined>((resolve) => {
        const element = document.createElement('input')
        element.type = 'file'
        element.addEventListener('change', () => {
            resolve(element.files?.[0])
        })
        element.click()
    })
}

function download(name: string, part: BlobPart) {
    const element = document.createElement('a')
    element.href = URL.createObjectURL(new Blob([part]))
    element.download = name
    element.click()
}

function timeout<T>(promise: PromiseLike<T>, time: number): Promise<T | undefined> {
    return Promise.race([promise, new Promise<undefined>((resolve) => setTimeout(() => resolve(undefined), time))])
}

async function restoreAll(parsed: BackupFormat) {
    for (const { name, version, stores } of parsed.instances) {
        const db = await openDB(name, version, {
            upgrade(db) {
                for (const name of db.objectStoreNames) {
                    db.deleteObjectStore(name)
                }
                for (const [storeName, { autoIncrement, keyPath, indexes }] of Object.entries(stores)) {
                    const store = db.createObjectStore(storeName, { autoIncrement, keyPath })
                    for (const { name, keyPath, multiEntry, unique } of indexes) {
                        store.createIndex(name, keyPath, { multiEntry, unique })
                    }
                }
            },
        })
        for (const [storeName, { records, keyPath }] of stores.entries()) {
            await db.clear(storeName)
            for (const [key, value] of records) {
                try {
                    if (keyPath) {
                        await db.add(storeName, value)
                    } else {
                        await db.add(storeName, value, key)
                    }
                } catch (error) {
                    console.error('Recover error when ', key, value, parsed)
                    // Error from IndexedDB transaction is not recoverable
                    throw error
                }
            }
        }
    }
}

async function backupAll() {
    const databases = await indexedDB.databases?.()
    if (databases === undefined) {
        return
    }
    const instances: BackupFormat['instances'] = []
    for (const { name, version } of databases) {
        const db = await timeout(openDB(name, version), 500)
        if (db === undefined) {
            continue
        }
        const stores: Instance['stores'] = new Map()
        for (const name of db.objectStoreNames) {
            const store = db.transaction(name).store
            const indexes: ObjectStore['indexes'] = []
            for (const indexName of store.indexNames) {
                const index = store.index(indexName)
                indexes.push({
                    name: index.name,
                    unique: index.unique,
                    multiEntry: index.multiEntry,
                    keyPath: index.keyPath,
                })
            }
            const records: ObjectStore['records'] = new Map()
            for await (const cursor of store) {
                records.set(cursor.key, cursor.value)
            }
            stores.set(name, {
                keyPath: store.keyPath,
                autoIncrement: store.autoIncrement,
                indexes,
                records,
            })
        }
        instances.push({ name: name, version: version, stores })
    }
    const payload: BackupFormat = {
        buildInfo: {
            'user-agent': navigator.userAgent,
            version: process.env.VERSION,
            'build-date': process.env.BUILD_DATE,
            'tag-name': process.env.TAG_NAME,
            'commit-hash': process.env.COMMIT_HASH,
            'commit-date': process.env.COMMIT_DATE,
            'remote-url': process.env.REMOTE_URL,
            'branch-name': process.env.BRANCH_NAME,
            dirty: process.env.DIRTY,
            'tag-dirty': process.env.TAG_DIRTY,
        },
        instances,
    }
    return typeson.stringify(payload, undefined, 2)
}
