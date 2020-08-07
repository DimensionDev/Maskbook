import { openDB, wrap } from 'idb'
import { keys, get } from 'lodash-es'
import React from 'react'
import typeson from './typeson'

export const DatabaseOps: React.FC = () => {
    const onBackup = async () => {
        const payload = await backupAll()
        if (payload === undefined) {
            return
        }
        download('backup.json', payload)
    }
    const onRestore = async () => {
        const file = await select()
        if (file === undefined) {
            return
        }
        const parsed = await typeson.parse(await file.text())
        await restoreAll(parsed as Info)
    }
    const onClear = async () => {
        const databases = await indexedDB.databases?.()
        if (databases === undefined) {
            return
        }
        for (const { name } of databases) {
            await timeout(wrap(indexedDB.deleteDatabase(name)), 10000)
        }
    }
    return (
        <section>
            <button onClick={onBackup}>Backup Database</button>
            <button onClick={onRestore}>Overwrite Database with backup</button>
            <button onClick={onClear}>Clear Database</button>
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
    return Promise.race([promise, new Promise<T>((resolve) => setTimeout(() => resolve(undefined), time))])
}
type Info = {
    buildInfo: Record<string, any>
    databases: { name: string; version: number }[]
    instances: Record<
        string,
        {
            stores: Record<string, any[]>
            indexes: any[]
            keyPath: Record<string, string | string[] | null>
            autoIncrement: Record<string, boolean>
        }
    >
}
async function restoreAll(parsed: Info) {
    console.log('restoring with', parsed)
    const { databases, instances } = parsed
    for (const { name, version } of databases) {
        if (!instances[name]) continue
        const { stores, indexes, autoIncrement, keyPath } = instances[name]
        const db = await openDB(name, version, {
            upgrade(db) {
                for (const name of db.objectStoreNames) {
                    db.deleteObjectStore(name)
                }
                for (const storeName of keys(stores)) {
                    const store = db.createObjectStore(storeName, {
                        autoIncrement: autoIncrement[storeName],
                        keyPath: keyPath[storeName],
                    })
                    for (const _ of Object.values(indexes[storeName as any] || {})) {
                        const index: any = _
                        store.createIndex(index.name, index.keyPath, {
                            multiEntry: index.multiEntry,
                            unique: index.unique,
                        })
                    }
                }
            },
        })
        for (const storeName of keys(stores)) {
            await db.clear(storeName)
            for (const [key, value] of stores[storeName]) {
                try {
                    if (!keyPath[storeName]) {
                        await db.add(storeName, value, key)
                    } else {
                        await db.add(storeName, value)
                    }
                } catch (e) {
                    console.error('Recover error when ', key, value, parsed)
                    // Error from IndexedDB transaction is not recoverable
                    throw e
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
    const instances: Record<string, unknown> = {}
    for (const { name, version } of databases) {
        const db = await timeout(openDB(name, version), 500)
        if (db === undefined) {
            continue
        }
        const keyPath: Record<string, unknown> = {}
        const autoIncrement: Record<string, boolean> = {}
        const indexes: Record<string, unknown[]> = {}
        const stores: Record<string, [unknown, unknown][]> = {}
        for (const name of db.objectStoreNames) {
            const store = db.transaction(name).store
            keyPath[name] = store.keyPath
            autoIncrement[name] = store.autoIncrement
            indexes[name] = []
            for (const indexName of store.indexNames) {
                const index = store.index(indexName)
                indexes[name].push({
                    name: index.name,
                    unique: index.unique,
                    multiEntry: index.multiEntry,
                    keyPath: index.keyPath,
                })
            }
            stores[name] = []
            let cursor = await store.openCursor()
            while (cursor) {
                stores[name].push([cursor.key, cursor.value])
                cursor = await cursor.continue()
            }
            if (indexes[name].length === 0) {
                delete indexes[name]
            }
            if (stores[name].length === 0) {
                delete stores[name]
            }
        }
        instances[name] = { stores, indexes, keyPath, autoIncrement }
    }
    const payload = {
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
        databases,
        instances,
    }
    return typeson.stringify(payload, undefined, 2)
}
