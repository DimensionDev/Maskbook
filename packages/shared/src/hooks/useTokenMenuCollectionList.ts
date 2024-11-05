import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

export function useTokenMenuCollectionList(
    collectionList_: Web3Helper.TokenResultAll[],
    currentCollection?: Web3Helper.TokenResultAll,
) {
    const collectionList = uniqBy(
        collectionList_,
        (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
    )

    const SourceTypeList = collectionList.map((x) => x.source)

    return collectionList.filter((x) => {
        if (
            currentCollection &&
            x.source !== currentCollection.source &&
            SourceType.CoinGecko === currentCollection.source &&
            SourceType.CoinGecko === x.source
        ) {
            return false
        }

        if (
            (currentCollection?.source === SourceType.NFTScan || !currentCollection) &&
            SourceTypeList.includes(SourceType.CoinGecko)
        ) {
            return false
        }

        return true
    })
}
