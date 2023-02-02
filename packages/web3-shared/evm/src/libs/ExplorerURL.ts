import { first } from 'lodash-es'
import type { ChainId } from '../types/index.js'
import { getExplorerConstants } from '../constants/index.js'

export class ExplorerURL {
    /**
     * @deprecated Don't new ExplorerURl()
     * Use ExplorerURL.from() stead
     */
    constructor() {}

    static from(chainId: ChainId) {
        const { API_KEYS = [], EXPLORER_API = '' } = getExplorerConstants(chainId)

        return {
            key: first(API_KEYS),
            url: EXPLORER_API,
        }
    }
}
