import urlcat from 'urlcat'
import { fetchJSON } from '../helpers'
import type { StorageAPI } from '../types'
import { KV_ROOT_URL } from './constants'

export class JSON_Storage implements StorageAPI.Storage {
    constructor(private prefix: string) {}

    async set<T extends {}>(key: string, value: T) {
        return fetchJSON<void>(
            urlcat(KV_ROOT_URL, 'api/:name', {
                name: `${this.prefix}_${key}`,
            }),
            {
                method: 'PUT',
                mode: 'cors',
                credentials: 'omit',
                body: JSON.stringify(value),
            },
        )
    }
    async get<T>(key: string) {
        const response = await fetchJSON<string>(
            urlcat(KV_ROOT_URL, 'api/:name', {
                name: `${this.prefix}_${key}`,
            }),
            {
                method: 'GET',
                mode: 'cors',
                credentials: 'omit',
            },
        )
        try {
            return JSON.parse(response) as T
        } catch {
            return
        }
    }
    async delete(key: string) {
        await fetchJSON<void>(
            urlcat(KV_ROOT_URL, 'api/:name', {
                name: `${this.prefix}_${key}`,
            }),
            {
                method: 'DELETE',
                mode: 'cors',
                credentials: 'omit',
            },
        )
    }
}

export class KeyValueAPI implements StorageAPI.Provider {
    createStorage(key: string): StorageAPI.Storage {
        return new JSON_Storage(key)
    }
}
