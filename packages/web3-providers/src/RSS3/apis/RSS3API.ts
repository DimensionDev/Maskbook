import { createIndicator, createNextIndicator, createPageable } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import { isValidAddress, type ChainId } from '@masknet/web3-shared-evm'
import { Telemetry } from '@masknet/web3-telemetry'
import { ExceptionID, ExceptionType } from '@masknet/web3-telemetry/types'
import * as RSS3Next from /* webpackDefer: true */ 'rss3-next'
import urlcat, { query } from 'urlcat'
import type { BaseHubOptions, RSS3BaseAPI } from '../../entry-types.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { NameServiceToChainMap, RSS3_ENDPOINT, RSS3_FEED_ENDPOINT, RSS3_LEGACY_ENDPOINT } from '../constants.js'
import { normalizedFeed } from '../helpers.js'
import { type RSS3NameServiceResponse, TAG, TYPE } from '../types.js'

interface RSS3Result<T> {
    total: number
    meta?: {
        cursor: string
    }
    data: T[]
}

const fetchFromRSS3 = <T>(url: string) => {
    return queryClient.fetchQuery({
        queryKey: [url],
        staleTime: 10_000,
        queryFn: () => fetchJSON<T>(url),
    })
}

// biome-ignore lint/complexity/noStaticOnlyClass: <explanation>
export class RSS3 {
    static createRSS3(address: string, sign: (message: string) => Promise<string>): RSS3Next.default {
        return new RSS3Next.default({
            endpoint: RSS3_LEGACY_ENDPOINT,
            address,
            sign,
        })
    }
    static async getFileData<T>(rss3: RSS3Next.default, address: string, key: string) {
        const file = await rss3.files.get(address)
        if (!file) throw new Error('The account was not found.')
        const descriptor = Object.getOwnPropertyDescriptor(file, key)
        return descriptor?.value as T | undefined
    }
    static async setFileData<T>(rss3: RSS3Next.default, address: string, key: string, data: T): Promise<T> {
        const file = await rss3.files.get(address)
        if (!file) throw new Error('The account was not found.')
        const descriptor = Object.getOwnPropertyDescriptor(file, key)
        const value = {
            ...(descriptor?.value as T | undefined),
            ...data,
        }
        rss3.files.set(Object.assign(file, { [key]: value }))
        await rss3.files.sync()
        return value
    }
    /** @deprecated */
    static async getDonations(address: string, { indicator, size = 100 }: BaseHubOptions<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(RSS3_FEED_ENDPOINT, address, {
            tag: TAG.donation,
            type: TYPE.donate,
            limit: size,
            cursor: indicator?.id || undefined,
            include_poap: true,
        })
        const { data: donations, meta } = await fetchFromRSS3<RSS3Result<RSS3BaseAPI.Donation>>(collectionURL)
        // A donation Feed contains multiple donation Actions. Let's flatten them.
        const result = donations.flatMap((donation) => {
            return donation.actions.map((action) => ({
                ...donation,
                actions: [action],
            }))
        })
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, meta?.cursor))
    }
    /** @deprecated */
    static async getFootprints(address: string, { indicator, size = 100 }: BaseHubOptions<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(RSS3_FEED_ENDPOINT, address, {
            tag: TAG.collectible,
            type: TYPE.poap,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { data, meta } = await fetchFromRSS3<RSS3Result<RSS3BaseAPI.Footprint>>(collectionURL)
        return createPageable(data, createIndicator(indicator), createNextIndicator(indicator, meta?.cursor))
    }
    /** get .csb handle info */
    static async getNameInfo(handle: string) {
        if (!handle) return
        const url = urlcat('https://pregod.rss3.dev/v1/ns/:id', { id: handle })
        return fetchFromRSS3<RSS3BaseAPI.NameInfo>(url)
    }

    static async getAllNotes(
        address: string,
        options: Partial<Record<string, string[] | string>> = {},
        { indicator, size = 100 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!address) return createPageable([], createIndicator(indicator))
        const queryString = query(
            {
                ...options,
                limit: size,
                cursor: indicator?.id || undefined,
            },
            { arrayFormat: 'repeat' },
        )
        const url = `${RSS3_FEED_ENDPOINT}/${address}?${queryString}`
        const res = await fetchFromRSS3<RSS3Result<RSS3BaseAPI.Web3Feed>>(url)
        if (!res.data)
            Telemetry.captureException(
                ExceptionType.Error,
                ExceptionID.FetchError,
                new Error(`No feeds response from ${url}`),
            )
        const { data = [], meta } = res
        data.forEach(normalizedFeed)
        // createNextIndicator() return a fallback indicator as `{ id: 1, index: 1 }`
        // which will fail the API, so we pass undefined if cursor is undefined
        return createPageable(
            data,
            createIndicator(indicator),
            meta?.cursor ? createNextIndicator(indicator, meta.cursor) : undefined,
        )
    }

    static async getProfiles(account: string | undefined) {
        if (!account) return []
        if (!account.includes('.') && !isValidAddress(account)) return []
        const url = urlcat(RSS3_ENDPOINT, '/datasets/domains/profiles', {
            account,
        })

        const response = await fetchFromRSS3<RSS3BaseAPI.ProfilesResponse | { error: string }>(url)
        if ('error' in response) return []

        return response
    }

    static async getNameService(handle: string) {
        const url = urlcat(RSS3_ENDPOINT, '/ns/:handle', {
            handle,
        })
        const response = await fetchFromRSS3<RSS3NameServiceResponse>(url)
        const suffix = handle.split('.').pop() as keyof typeof NameServiceToChainMap

        if ('error' in response) return

        return {
            address: response.address,
            chainId: NameServiceToChainMap[suffix],
        }
    }
}
