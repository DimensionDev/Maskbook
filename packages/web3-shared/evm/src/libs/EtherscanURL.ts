import type { ChainId } from '../types/index.js'
import { getEtherscanConstants } from '../constants/index.js'

export class EtherscanURL {
    static from(chainId: ChainId) {
        const { ETHERSCAN_URL = '' } = getEtherscanConstants(chainId)
        if (process.env.NODE_ENV === 'development' && !EtherscanURL) {
            console.error('Etherscan URL for %s is empty', chainId)
        }
        return ETHERSCAN_URL
    }
}
