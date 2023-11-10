import type { Eth } from 'web3-eth'
import * as Web3Eth from /* webpackDefer: true */ 'web3-eth'
import type { provider as Provider } from 'web3-core'

/**
 * A Web3 class that is much simpler than the original web3js one.
 */
export class Web3 {
    public eth: Eth = null!

    constructor(provider?: Provider) {
        const Eth_ = Web3Eth.default as unknown as typeof Eth
        this.eth = provider ? new Eth_(provider) : new Eth_()
    }

    public setProvider(provider: Provider) {
        this.eth.setProvider(provider)
    }
}
