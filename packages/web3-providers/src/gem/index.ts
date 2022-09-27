import urlcat from 'urlcat'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { HubOptions, HubIndicator, SourceType, NonFungibleTokenRarity } from '@masknet/web3-shared-base'
import type { NonFungibleTokenAPI } from '../types/index.js'
import { GEM_API_URL, RARITY_SOURCE_TYPE } from './constants.js'
import { createLookupTableResolver } from '@masknet/shared-base'

const resolveRarityId = createLookupTableResolver<
    SourceType.Gem | SourceType.RaritySniper | SourceType.TraitSniper,
    string
>(
    {
        [SourceType.Gem]: 'gem',
        [SourceType.RaritySniper]: 'rarity_sniper',
        [SourceType.TraitSniper]: 'trait_sniper',
    },
    '',
)

async function fetchFromGem<T>(pathname: string, init?: RequestInit) {
    const response = await globalThis.fetch(urlcat(GEM_API_URL, pathname), init)
    const data = (await response.json()) as {
        data: T
    }
    return data.data
}

export class GemAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getRarity(address: string, tokenId: string, options?: HubOptions<ChainId, HubIndicator>) {
        const response = await fetchFromGem<Record<string, NonFungibleTokenRarity<ChainId>>>(
            urlcat('/rarity/:address/:tokenId', {
                address: address.toLowerCase(),
                tokenId: tokenId.toLowerCase(),
            }),
        )

        for (const sourceType of RARITY_SOURCE_TYPE) {
            const rarity = response[resolveRarityId(sourceType)]
            if (rarity) return rarity
        }
        return
    }
}
