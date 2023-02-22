import { uniqBy } from 'lodash-es'
import type { Web3Helper } from '@masknet/web3-helpers'
import { SourceType } from '@masknet/web3-shared-base'

// Filter same CoinMarketCap token when it exists in Coingecko Collections.
export function useTokenMenuCollectionList(
    collectionList_: Web3Helper.TokenResultAll[],
    currentCollection?: Web3Helper.TokenResultAll,
) {
    if (collectionList_.length === 0) return collectionList_

    const collectionList = uniqBy(
        collectionList_,
        (x) => `${x.address?.toLowerCase()}_${x.chainId}_${x.type}_${x.name?.toLowerCase()}_${x.source}`,
    )

    const currentSourceCollectionsOfName = collectionList
        .filter((x) => x.source === currentCollection?.source)
        .map((x) => x.name.toLowerCase())

    return collectionList.filter(
        (x) =>
            !(
                x.source === getTheOtherFungibleTokenSource(currentCollection?.source) &&
                currentSourceCollectionsOfName.includes(x.name.toLowerCase())
            ),
    )
}

function getTheOtherFungibleTokenSource(source?: SourceType) {
    return source === SourceType.CoinGecko ? SourceType.CoinMarketCap : SourceType.CoinGecko
}
