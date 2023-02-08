import urlcat from 'urlcat'
import type { ChainId } from '../types/index.js'
import { getExplorerConstants } from '../constants/index.js'

export class EtherscanURL {
    /**
     * @deprecated Don't new EtherscanURL()
     * Use EtherscanURL.from() stead
     */
    constructor() {}

    static from(chainId: ChainId) {
        const { ETHERSCAN_URL = '' } = getExplorerConstants(chainId)

        return urlcat(ETHERSCAN_URL, {
            chain_id: chainId,
        })
    }
}
