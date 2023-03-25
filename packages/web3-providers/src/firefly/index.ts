import urlcat from 'urlcat'
import type { FireflyBaseAPI } from '../types/firefly.js'
import { FIREFLY_API_URL } from './constants.js'
import { fetchJSON } from '../entry-helpers.js'
import { EnhanceableSite, getSiteType } from '@masknet/shared-base'

interface responseData {
    code: number
    reason: string
    message: string
    metaData: FireflyBaseAPI.MetaData
}
const genKey = (namespace: string, userId: string) =>
    `${namespace}-${(getSiteType() || EnhanceableSite.Twitter).replace('.com', '')}-${userId}`

export class FireflyAPI implements FireflyBaseAPI.Provider {
    async get<T>(namespace: string, userId: string, address: string): Promise<T> {
        if (!userId || !address) return {} as T
        const response = await fetchJSON<responseData>(
            urlcat(`${FIREFLY_API_URL}/get`, {
                key: genKey(namespace, userId),
                address,
            }),
        )
        return JSON.parse(response.metaData.value) as T
    }

    async set<T>(namespace: string, userId: string, address: string, value: T, signature: string): Promise<void> {
        if (!userId || !address || !value || signature) return
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
        const result = await response.json()
        if (result !== 200) throw new Error(result.message)
        return
    }
}
