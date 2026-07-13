import { createIndicator, createNextIndicator, createPageable } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Telemetry } from '@masknet/web3-telemetry'
import { ExceptionID, ExceptionType } from '@masknet/web3-telemetry/types'
import urlcat, { query } from 'urlcat'
import type { BaseHubOptions, RSS3BaseAPI } from '../../entry-types.js'
import { fetchJSON } from '../../helpers/fetchJSON.js'
import { NameServiceToChainMap, RSS3_ENDPOINT, RSS3_FEED_ENDPOINT } from '../constants.js'
import { normalizedFeed } from '../helpers.js'
import type { RSS3NameServiceResponse } from '../types.js'

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
export const RSS3 = {
    /** get .csb handle info */
    async getNameInfo(handle: string) {
        if (!handle) return
        const url = urlcat('https://pregod.rss3.dev/v1/ns/:id', { id: handle })
        return fetchFromRSS3<RSS3BaseAPI.NameInfo>(url)
    },

    async getAllNotes(
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
    },

    async getNameService(handle: string) {
        const url = urlcat(RSS3_ENDPOINT, '/ns/:handle', {
            handle,
        })
        const response = await fetchFromRSS3<RSS3NameServiceResponse>(url)

        if ('error' in response) return

        const suffix = handle.split('.').pop() as keyof typeof NameServiceToChainMap
        return {
            address: response.address,
            chainId: NameServiceToChainMap[suffix],
        }
    },
}
