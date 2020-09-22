import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext(['background', 'debugging'], 'web3')

// This is the real web3 instance that interactives with the Ethereum network.
export const web3 = new Web3()

// 24 confirmation blocks is not necessary
web3.eth.transactionConfirmationBlocks = 6

export function createWeb3(provider: Provider, privKeys: string[] = []) {
    web3.setProvider(provider)
    web3.eth.accounts.wallet.clear()
    privKeys.forEach((k) => web3.eth.accounts.wallet.add(k))
    return web3
}
