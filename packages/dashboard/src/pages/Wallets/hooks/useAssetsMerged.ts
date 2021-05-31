import type { Asset } from '../types'
import { CONSTANTS, useConstant } from '@dimensiondev/web3-shared'
import { uniqBy } from 'lodash-es'
import { formatEthereumAddress } from '@dimensiondev/maskbook-shared'
import { getTokenUSDValue } from '../helpers'

/**
 * Merge multiple token lists into one which sorted by balance.
 * The order of result values is determined by the order they occur in the array.
 * @param listOfTokens
 */
export function useAssetsMerged(...listOfTokens: Asset[][]) {
    const NATIVE_TOKEN_ADDRESS = useConstant(CONSTANTS, 'NATIVE_TOKEN_ADDRESS')

    return uniqBy(
        listOfTokens.flatMap((x) => x),
        (x) => formatEthereumAddress(x.token.address),
    ).sort((a, z) => {
        // the native token goes first place
        if (a.token.address === NATIVE_TOKEN_ADDRESS) return -1
        if (z.token.address === NATIVE_TOKEN_ADDRESS) return 1

        // token with high usd value estimation has priority
        const valueDifference = getTokenUSDValue(z) - getTokenUSDValue(a)
        if (valueDifference !== 0) return valueDifference

        if (a.balance.length > z.balance.length) return -1
        if (a.balance.length < z.balance.length) return 1
        if (a.balance > z.balance) return -1
        if (a.balance < z.balance) return 1
        return 0
    })
}
