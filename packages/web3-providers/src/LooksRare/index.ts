import type { HubOptions, NonFungibleAsset } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { NonFungibleTokenAPI } from '../types'
import { LOOKSRARE_API_URL } from './constants'
import type { LooksRareCollectionStats } from './types'

export async function fetchFromLooksRare<T>(url: string, chainId: ChainId) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Matic].includes(chainId)) return

    const response = await globalThis.r2d2Fetch(urlcat(LOOKSRARE_API_URL, url), { method: 'GET' })
    if (response.ok) {
        return (await response.json()) as T
    } else {
        throw new Error('Fetch failed')
    }
}

export class LooksRareAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(): Promise<NonFungibleAsset<ChainId, SchemaType>> {
        throw new Error('Not implemented yet.')
    }
    async getCollectionStats(
        address: string,
        { chainId = ChainId.Mainnet }: HubOptions<ChainId> = {},
    ): Promise<LooksRareCollectionStats | undefined> {
        const response = await fetchFromLooksRare<{ data: LooksRareCollectionStats }>(
            urlcat('/api/v1/collections/stats', {
                address,
            }),
            chainId,
        )
        return response?.data
    }
}
