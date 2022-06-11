import urlcat from 'urlcat'
import { fetchJSON } from '../helpers'
import type { StorageAPI } from '../types'
import { KV_ROOT_URL } from './constants'

export class JSON_Storage<T> implements StorageAPI.Storage<T> {
    constructor(private prefix: string) {}

    async get(key: string) {
        try {
            return fetchJSON<T>(
                urlcat(KV_ROOT_URL, 'api/:name', {
                    name: `${this.prefix}_${key}`,
                }),
                {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'text/plain',
                    },
                },
            )
        } catch {
            return
        }
    }

    async set(key: string, value: T) {
        await fetch(
            urlcat(KV_ROOT_URL, 'api/:name', {
                name: `${this.prefix}_${key}`,
            }),
            {
                method: 'PUT',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(value),
            },
        )
    }
}

export class KeyValueAPI implements StorageAPI.Provider {
    createJSON_Storage<T>(key: string): StorageAPI.Storage<T> {
        return new JSON_Storage<T>(key)
    }
}
