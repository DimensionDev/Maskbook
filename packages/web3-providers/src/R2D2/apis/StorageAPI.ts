import urlcat from 'urlcat'
import { KV_ROOT_URL } from '../constants.js'
import { fetchJSON } from '../../entry-helpers.js'
import type { StorageAPI } from '../../entry-types.js'

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
                {
                    squashed: true,
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

export class R2D2KeyValueAPI implements StorageAPI.Provider {
    createJSON_Storage<T>(key: string): StorageAPI.Storage<T> {
        return new JSON_Storage<T>(key)
    }
}
