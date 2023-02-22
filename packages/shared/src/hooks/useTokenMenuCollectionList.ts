import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

export function useTokenMenuCollectionList(
    collectionList_: Web3Helper.TokenResultAll[],
    currentCollection?: Web3Helper.TokenResultAll,
) {
    if (collectionList_.length === 0) return collectionList_

    const collectionList = uniqBy(
        collectionList_,
        (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
    )

    return collectionList.filter(
        (x) =>
            !(
                x.source !== currentCollection?.source &&
                [SourceType.CoinMarketCap, SourceType.CoinGecko].includes(x.source)
            ),
    )
}
