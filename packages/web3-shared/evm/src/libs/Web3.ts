import * as Web3Eth from /* webpackDefer: true */ 'web3-eth'
import type { SupportedProviders } from 'web3-types'

/**
 * A Web3 class that is much simpler than the original web3js one.
 */
export class Web3 {
    public eth: Web3Eth.Web3Eth

    constructor(provider?: SupportedProviders | string) {
        this.eth = new Web3Eth.Web3Eth(provider)
    }
}
