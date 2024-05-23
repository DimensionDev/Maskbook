import urlcat from 'urlcat'
import { KV_ROOT_URL } from '../constants/index.js'
import { fetchSquashedJSON } from '../../helpers/fetchJSON.js'

export class R2D2GetterSetter<T> {
    constructor(private prefix: string) {}

    async get(key: string) {
        try {
            return await fetchSquashedJSON<T>(
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
