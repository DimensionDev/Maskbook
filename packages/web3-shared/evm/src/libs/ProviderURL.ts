import urlcat from 'urlcat'
import { hexToNumber, sha3 } from 'web3-utils'
import { getRPCConstants } from '../constants/constants.js'
import type { ChainId } from '../types/index.js'

export class ProviderURL {
    /**
     * @deprecated Don't new ProviderEditor()
     * Use ProviderEditor.from(chainId) stead.
     */
    constructor() {}

    get footprint() {
        return sha3([navigator.userAgent, navigator.language, screen.width, screen.height].join())
    }

    get seed() {
        return this.footprint ? hexToNumber(this.footprint.slice(0, 10)) : 0
    }

    static from(chainId: ChainId) {
        const { RPC_URL } = getRPCConstants(chainId)
        if (!RPC_URL) throw new Error('No RPC preset.')

        return urlcat(RPC_URL, {
            chain_id: chainId,
            seed: new ProviderURL().seed,
        })
    }

    static fromOfficial(chainId: ChainId) {
        const { RPC_URL_OFFICIAL } = getRPCConstants(chainId)
        if (!RPC_URL_OFFICIAL) throw new Error('No RPC preset.')

        return RPC_URL_OFFICIAL
    }
}
