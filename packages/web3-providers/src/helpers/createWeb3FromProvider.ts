import type { provider as Provider } from 'web3-core'
import { Web3 } from '@masknet/web3-shared-evm'

export function createWeb3FromProvider(provider: Provider) {
    const web3 = new Web3(provider)
    web3.eth.transactionBlockTimeout = 10 * 1000
    web3.eth.transactionPollingTimeout = 10 * 1000
    // @ts-expect-error private or untyped API?
    // disable the default polling strategy
    web3.eth.transactionPollingInterval = Number.MAX_SAFE_INTEGER
    return web3
}
