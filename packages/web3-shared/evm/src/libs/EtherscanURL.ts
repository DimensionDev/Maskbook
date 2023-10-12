import type { ChainId } from '../types/index.js'
import { getEtherscanConstants } from '../constants/index.js'

export class EtherscanURL {
    static from(chainId: ChainId) {
        const { ETHERSCAN_URL = '' } = getEtherscanConstants(chainId)
        return ETHERSCAN_URL
    }
}
