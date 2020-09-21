import Web3 from 'web3'
import type { provider as Provider } from 'web3-core'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext(['background', 'debugging'], 'web3')

export const web3 = new Web3()

web3.eth.transactionConfirmationBlocks = 6

export function createWeb3(provider: Provider, privKeys: string[] = []) {
    web3.setProvider(provider)
    privKeys.forEach((k) => web3.eth.accounts.wallet.add(k))
    return web3
}
