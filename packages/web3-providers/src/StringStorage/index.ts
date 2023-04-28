import urlcat from 'urlcat'
import { FIREFLY_API_URL } from './constants.js'
import { fetchJSON, parseJSON } from '../entry-helpers.js'
import type { StringStorageBaseAPI } from '../entry-types.js'

interface ResponseData {
    code: number
    reason: string
    message: string
    metaData: StringStorageBaseAPI.MetaData
}
const genKey = (namespace: string, userId: string) => `${namespace}-${userId.replace(/\./g, '%2E')}`

export class StringStorageAPI implements StringStorageBaseAPI.Provider {
    async get<T>(namespace: string, userId: string, address: string) {
        if (!userId || !address) return
        const response = await fetchJSON<ResponseData>(
            urlcat(`${FIREFLY_API_URL}/get`, {
                key: genKey(namespace, userId),
                address,
            }),
        )
        if (!response.metaData?.value) return
        return parseJSON<T>(response.metaData.value)
    }

    async set<T>(namespace: string, userId: string, address: string, value: T, signature: string): Promise<void> {
        if (!userId || !address || !value || !signature) return
        const response = await fetch(`${FIREFLY_API_URL}/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value: JSON.stringify(value),
                address,
                signature,
                key: genKey(namespace, userId),
            }),
        })
        const result: {
            code: number
            message: string
        } = await response.json()
        if (result.code !== 200) throw new Error(result.message)
        return
    }
}
