import { Eth } from 'web3-eth'
import type { provider as Provider } from 'web3-core'

/**
 * A Web3 class that is much simpler than the original web3js one.
 */
export class Web3 {
    public eth: Eth = null!

    constructor(provider?: Provider) {
        this.eth = provider ? new Eth(provider) : new Eth()
    }

    public setProvider(provider: Provider) {
        this.eth.setProvider(provider)
    }
}
