import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

export function useTokenMenuCollectionList(
    collectionList_: Web3Helper.TokenResultAll[],
    currentCollection?: Web3Helper.TokenResultAll,
) {
    return uniqBy(
        collectionList_,
        (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
    ).filter(
        (x) =>
            !(
                currentCollection &&
                x.source !== currentCollection.source &&
                [SourceType.CoinMarketCap, SourceType.CoinGecko].includes(currentCollection.source) &&
                [SourceType.CoinMarketCap, SourceType.CoinGecko].includes(x.source)
            ),
    )
}
