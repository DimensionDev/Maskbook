import urlcat from 'urlcat'
import { fetchJSON } from '../helpers'
import type { StorageAPI } from '../types'
import { KV_ROOT_URL } from './constants'

export class JSON_Storage implements StorageAPI.Storage {
    constructor(private prefix: string) {}

    async get<T>(key: string) {
        try {
            return fetchJSON<T>(
                urlcat(KV_ROOT_URL, 'api/:name', {
                    name: `${this.prefix}_${key}`,
                }),
                {
                    method: 'GET',
                    mode: 'no-cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )
        } catch {
            return
        }
    }

    async set<T extends {}>(key: string, value: T) {
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
    createJSON_Storage(key: string): StorageAPI.Storage {
        return new JSON_Storage(key)
    }
}
