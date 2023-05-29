import urlcat from 'urlcat'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { SourceType, type NonFungibleTokenRarity } from '@masknet/web3-shared-base'
import { createLookupTableResolver } from '@masknet/shared-base'
import { GEM_API_URL, RARITY_SOURCE_TYPE } from './constants.js'
import type { HubOptions_Base, NonFungibleTokenAPI } from '../entry-types.js'
import { fetchJSON } from '../entry-helpers.js'

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
    const { data } = await fetchJSON<{ data: T | undefined }>(urlcat(GEM_API_URL, pathname), init, {
        enableCache: true,
    })
    return data
}

export class GemAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getRarity(address: string, tokenId: string, options?: HubOptions_Base<ChainId>) {
        const response = await fetchFromGem<Record<string, NonFungibleTokenRarity<ChainId>>>(
            urlcat('/rarity/:address/:tokenId', {
                address: address.toLowerCase(),
                tokenId: tokenId.toLowerCase(),
            }),
        )

        if (!response) return

        for (const sourceType of RARITY_SOURCE_TYPE) {
            const rarity = response[resolveRarityId(sourceType)]
            if (rarity) return rarity
        }
        return
    }
}
