import { uniqBy } from 'lodash-es'
import { formatChecksumAddress } from '../../plugins/Wallet/formatter'
import { CONSTANTS } from '../constants'
import type { AssetDetailed } from '../types'
import { getTokenUSDValue } from '../helpers'
import { useChainId } from './useChainState'
import { useConstant } from './useConstant'

/**
 * Merge multiple token lists into one which sorted by balance.
 * The order of result values is determined by the order they occur in the array.
 * @param listOfTokens
 */
export function useAssetsDetailedMerged(...listOfTokens: AssetDetailed[][]) {
    const chainId = useChainId()
    const ETH_ADDRSS = useConstant(CONSTANTS, 'ETH_ADDRESS')
    return uniqBy(
        listOfTokens.flatMap((x) => x),
        (x) => formatChecksumAddress(x.token.address),
    )
        .filter((x) => x.token.chainId === chainId)
        .sort((a, z) => {
            // ether goes first place
            if (a.token.address === ETH_ADDRSS) return -1
            if (z.token.address === ETH_ADDRSS) return 1

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
