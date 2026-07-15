import type { ChainId } from '../types/index.js'
import { getEtherscanConstant } from '../constants/index.js'

export const EtherscanURL = {
    from(chainId: ChainId) {
        const ETHERSCAN_URL = getEtherscanConstant(chainId, 'ETHERSCAN_URL') || ''
        if (process.env.NODE_ENV === 'development' && !ETHERSCAN_URL) {
            console.error('Etherscan URL for %s is empty', chainId)
        }
        return ETHERSCAN_URL
    },
}
