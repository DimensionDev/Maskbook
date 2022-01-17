import urlcat from 'urlcat'
import { fetchJSON } from '../helpers'
import { KV_ROOT_URL } from './constants'

interface Storage {
    set<T extends {}>(key: string, value: T): Promise<void>
    get<T>(key: string): Promise<T | void>
    delete?: (key: string) => Promise<void>
}

interface Provider {
    createJSON_Storage?: (key: string) => Storage
    createBinaryStorage?: (key: string) => Storage
}

class JSON_Storage implements Storage {
    constructor(private prefix: string) {}

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
    async get<T>(key: string) {
        try {
            return fetchJSON<T>(
                urlcat(KV_ROOT_URL, 'api/:name', {
                    name: `${this.prefix}_${key}`,
                }),
                {
                    method: 'GET',
                    mode: 'cors',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )
        } catch {
            return
        }
    }
}

export function createJSON_Storage(key: string): Storage {
    return new JSON_Storage(key)
}
