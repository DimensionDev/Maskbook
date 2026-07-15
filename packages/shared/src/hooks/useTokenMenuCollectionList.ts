import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'
import { useMemo } from 'react'

export function useTokenMenuCollectionList(
    collections: Web3Helper.TokenResultAll[],
    currentCollection?: Web3Helper.TokenResultAll,
) {
    return useMemo(() => {
        const collectionList = uniqBy(
            collections,
            (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
        )

        const SourceTypeList = new Set(collectionList.map((x) => x.source))

        return collectionList.filter((x) => {
            if (
                currentCollection &&
                x.source !== currentCollection.source &&
                SourceType.CoinGecko === currentCollection.source &&
                SourceType.CoinGecko === x.source
            ) {
                return false
            }

            if (!currentCollection && SourceTypeList.has(SourceType.CoinGecko)) {
                return false
            }

            return true
        })
    }, [collections, currentCollection])
}
