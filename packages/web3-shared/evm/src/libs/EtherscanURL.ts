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
        const { EXPLORER_API = '' } = getExplorerConstants(chainId)

        return urlcat(EXPLORER_API, {
            chain_id: chainId,
        })
    }
}
