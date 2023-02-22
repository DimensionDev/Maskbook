import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

// Filter same CoinMarketCap token when it exists in Coingecko Collections.
export function useTokenMenuCollectionList(collectionList_: Web3Helper.TokenResultAll[]) {
    const collectionList = uniqBy(
        collectionList_,
        (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
    )

    if (collectionList?.[0].source === SourceType.CoinMarketCap) return collectionList

    const coingeckoCollectionsOfName = collectionList
        .filter((x) => x.source === SourceType.CoinGecko)
        .map((x) => x.name)

    return collectionList.filter(
        (x) => !(x.source === SourceType.CoinMarketCap && coingeckoCollectionsOfName.includes(x.name)),
    )
}
