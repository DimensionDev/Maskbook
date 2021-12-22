import type { Asset } from '../types'
import { useChainId } from './useChainId'
import { uniqBy } from 'lodash-unified'
import { formatEthereumAddress, makeSortAssertFn } from '../utils'

/**
 * Merge multiple token lists into one which sorted by balance.
 * The order of result values is determined by the order they occur in the array.
 * @param listOfTokens
 */
export function useAssetsMerged(...listOfTokens: Asset[][]) {
    const chainId = useChainId()
    const items = uniqBy(
        listOfTokens.flatMap((x) => x),
        (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.address)}`,
    )
    return items.sort(makeSortAssertFn(chainId))
}
