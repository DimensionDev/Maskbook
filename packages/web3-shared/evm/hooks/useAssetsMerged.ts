import type { Asset } from '../types'
import { useChainId } from './useChainId'
import { uniqBy } from 'lodash-unified'
import { formatEthereumAddress, makeSortAssertFn } from '../utils'
import { useTokenConstants } from '../constants'
import { useMemo } from 'react'

const EMPTY_LIST: never[] = []
/**
 * Merge multiple token lists into one which sorted by balance.
 * The order of result values is determined by the order they occur in the array.
 * @param listOfTokens
 */
export function useAssetsMerged(...listOfTokens: Asset[][]) {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()

    const mergedAssets = useMemo(() => {
        if (!NATIVE_TOKEN_ADDRESS) return EMPTY_LIST
        return uniqBy(
            listOfTokens.flatMap((x) => x),
            (x) => `${x.token.chainId}_${formatEthereumAddress(x.token.address)}`,
        ).sort(makeSortAssertFn(chainId))
    }, [NATIVE_TOKEN_ADDRESS, listOfTokens, chainId])

    return mergedAssets
}
