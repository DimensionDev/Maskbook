import RSS3 from 'rss3-next'
import urlcat, { query } from 'urlcat'
import { createIndicator, createNextIndicator, createPageable, queryClient } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { RSS3_FEED_ENDPOINT, RSS3_ENDPOINT, NameServiceToChainMap, RSS3_LEGACY_ENDPOINT } from '../constants.js'
import { type RSS3NameServiceResponse, type RSS3ProfilesResponse, TAG, TYPE } from '../types.js'
import { normalizedFeed } from '../helpers.js'
import { fetchJSON } from '../../entry-helpers.js'
import { RSS3BaseAPI, type HubOptions_Base } from '../../entry-types.js'

interface RSS3Result<T> {
    cursor?: string
    total: number
    result: T[]
}

const fetchFromRSS3 = <T>(url: string) => {
    return queryClient.fetchQuery({
        queryKey: [url],
        staleTime: 10_000,
        queryFn: () => fetchJSON<T>(url),
    })
}

export class RSS3API implements RSS3BaseAPI.Provider {
    createRSS3(
        address: string,
        sign: (message: string) => Promise<string> = () => {
            throw new Error('Not supported.')
        },
    ): RSS3 {
        return new RSS3({
            endpoint: RSS3_LEGACY_ENDPOINT,
            address,
            sign,
        })
    }
    async getFileData<T>(rss3: RSS3, address: string, key: string) {
        const file = await rss3.files.get(address)
        if (!file) throw new Error('The account was not found.')
        const descriptor = Object.getOwnPropertyDescriptor(file, key)
        return descriptor?.value as T | undefined
    }
    async setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T> {
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
    async getDonations(address: string, { indicator, size = 100 }: HubOptions_Base<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(RSS3_FEED_ENDPOINT, address, {
            tag: TAG.donation,
            type: TYPE.donate,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { result: donations, cursor } = await fetchFromRSS3<RSS3Result<RSS3BaseAPI.Donation>>(collectionURL)
        // A donation Feed contains multiple donation Actions. Let's flatten them.
        const result = donations.flatMap((donation) => {
            return donation.actions.map((action) => ({
                ...donation,
                actions: [action],
            }))
        })
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
    async getFootprints(address: string, { indicator, size = 100 }: HubOptions_Base<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(RSS3_FEED_ENDPOINT, address, {
            tag: TAG.collectible,
            type: TYPE.poap,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { result, cursor } = await fetchFromRSS3<RSS3Result<RSS3BaseAPI.Footprint>>(collectionURL)
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
    /** get .csb handle info */
    async getNameInfo(handle: string) {
        if (!handle) return
        const url = urlcat('https://pregod.rss3.dev/v1/ns/:id', { id: handle })
        return fetchFromRSS3<RSS3BaseAPI.NameInfo>(url)
    }

    /**
     * @deprecated
     * Get feeds in tags of donation, collectible and transaction
     */
    async getWeb3Feeds(address: string, { indicator, size = 100 }: HubOptions_Base<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const tags = [RSS3BaseAPI.Tag.Donation, RSS3BaseAPI.Tag.Collectible, RSS3BaseAPI.Tag.Transaction]
        const queryString = `tag=${tags.join('&tag=')}&${query({
            limit: size,
            cursor: indicator?.id ?? '',
            include_poap: true,
        })}`
        const url = urlcat(RSS3_FEED_ENDPOINT, `/:address?${queryString}`, {
            address,
        })
        const { result, cursor } = await fetchFromRSS3<{
            result: RSS3BaseAPI.Activity[]
            cursor?: string
        }>(url)
        result.forEach(normalizedFeed)
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
    async getAllNotes(
        address: string,
        options: Partial<Record<string, string>> = {},
        { indicator, size = 100 }: HubOptions_Base<ChainId> = {},
    ) {
        if (!address) return createPageable([], createIndicator(indicator))
        const url = urlcat(RSS3_FEED_ENDPOINT, '/:address', {
            ...options,
            address,
            limit: size,
            cursor: indicator?.id ?? '',
        })
        const res = await fetchFromRSS3<{
            result: RSS3BaseAPI.Web3Feed[]
            cursor?: string
        }>(url)
        if (!res.result) Sentry.captureException(new Error(`No feeds response from ${url}`))
        const { result = [], cursor } = res
        result.forEach(normalizedFeed)
        // createNextIndicator() return a fallback indicator as `{ id: 1, index: 1 }`
        // which will fail the API, so we pass undefined if cursor is undefined
        return createPageable(
            result,
            createIndicator(indicator),
            cursor ? createNextIndicator(indicator, cursor) : undefined,
        )
    }

    async getProfiles(handle: string) {
        const url = urlcat(RSS3_ENDPOINT, '/profiles/:handle', {
            handle,
        })
        const response = await fetchFromRSS3<RSS3ProfilesResponse>(url)

        if ('error' in response) return []
        return response.result
    }

    async getNameService(handle: string) {
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
