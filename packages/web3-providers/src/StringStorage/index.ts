import urlcat from 'urlcat'
import { FIREFLY_API_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import { EnhanceableSite, getSiteType } from '@masknet/shared-base'
import type { StringStorageBaseAPI } from '../types/StringStorage.js'

interface responseData {
    code: number
    reason: string
    message: string
    metaData: StringStorageBaseAPI.MetaData
}
const genKey = (namespace: string, userId: string) =>
    `${namespace}-${(getSiteType() || EnhanceableSite.Twitter).replace('.com', '')}-${userId}`

export class StringStorageAPI implements StringStorageBaseAPI.Provider {
    async get(namespace: string, userId: string, address: string) {
        if (!userId || !address) return ''
        const response = await fetchJSON<responseData>(
            urlcat(`${FIREFLY_API_URL}/get`, {
                key: genKey(namespace, userId),
                address,
            }),
        )
        return response.metaData.value
    }

    async set(namespace: string, userId: string, address: string, value: string, signature: string): Promise<void> {
        if (!userId || !address || !value || signature) return
        const response = await fetch(`${FIREFLY_API_URL}/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                value,
                address,
                signature,
                key: genKey(namespace, userId),
            }),
        })
        const result = await response.json()
        if (result !== 200) throw new Error(result.message)
        return
    }
}
