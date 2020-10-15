import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext(['background', 'debugging'], 'web3')

// The poll stored the real web3 instance that interactives with the Ethereum network.
const poll = new Map<string, Web3>()

function createWeb3Instance(id: string, provider: Provider) {
    const web3 = poll.get(id) ?? new Web3()
    if (web3.currentProvider !== provider) web3.setProvider(provider)

    // 24 confirmation blocks is not necessary
    web3.eth.transactionConfirmationBlocks = 0
    return web3
}

export function createWeb3(id: string, provider: Provider, privKeys: string[] = []) {
    const web3 = createWeb3Instance(id, provider)
    if (privKeys.length) {
        web3.eth.accounts.wallet.clear()
        privKeys.forEach((k) => web3.eth.accounts.wallet.add(k))
    }
    return web3
}
