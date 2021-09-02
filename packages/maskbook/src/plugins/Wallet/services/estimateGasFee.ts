import { getSuggestedGasFees } from '../apis/metaswap'
import type { ChainId } from '@masknet/web3-shared'

export async function getEstimateGasFees(chainId: ChainId) {
    return getSuggestedGasFees(chainId)
}
