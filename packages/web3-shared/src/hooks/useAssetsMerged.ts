import type { Asset } from '../types'
import { useChainId } from './useChainId'
import { uniqBy } from 'lodash-es'
import { formatEthereumAddress, getChainIdFromName, getTokenUSDValue, isSameAddress } from '../utils'
import { useTokenConstants } from '../constants'

/**
 * Merge multiple token lists into one which sorted by balance.
 * The order of result values is determined by the order they occur in the array.
 * @param listOfTokens
 */
export function useAssetsMerged(...listOfTokens: Asset[][]) {
    const chainId = useChainId()
    const { NATIVE_TOKEN_ADDRESS } = useTokenConstants()
    if (!NATIVE_TOKEN_ADDRESS) return []
    return uniqBy(
        listOfTokens.flatMap((x) => x),
        (x) => `${x.chain}_${formatEthereumAddress(x.token.address)}`,
    ).sort((a, z) => {
        // the tokens with the current chain id goes first
        if (a.chain !== z.chain) {
            if (getChainIdFromName(a.chain) === chainId) return -1
            if (getChainIdFromName(z.chain) === chainId) return 1
        }

        // the native token goes first
        if (!isSameAddress(a.token.address, z.token.address)) {
            if (isSameAddress(a.token.address, NATIVE_TOKEN_ADDRESS)) return -1
            if (isSameAddress(z.token.address, NATIVE_TOKEN_ADDRESS)) return 1
        }

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
