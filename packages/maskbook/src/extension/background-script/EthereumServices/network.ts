import type { TransactionConfig } from 'web3-core'
import * as Maskbook from './providers/Maskbook'
import * as MetaMask from './providers/MetaMask'
import { ChainId, ProviderType } from '../../../web3/types'
import { currentSelectedWalletProviderSettings } from '../../../plugins/Wallet/settings'

async function createWeb3(chainId: ChainId) {
    const provider = currentSelectedWalletProviderSettings.value
    if (provider === ProviderType.MetaMask) return await MetaMask.createWeb3()
    return Maskbook.createWeb3({ chainId })
}

export async function getGasPrice(chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getGasPrice()
}

export async function getBlockNumber(chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getBlockNumber()
}

export async function getBalance(address: string, chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getBalance(address)
}

export async function getTransaction(id: string, chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getTransaction(id)
}

export async function getTransactionReceipt(id: string, chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getTransactionReceipt(id)
}

export async function getTransactionCount(address: string, chainId: ChainId) {
    return (await createWeb3(chainId)).eth.getTransactionCount(address)
}

export async function estimateGas(config: TransactionConfig, chainId: ChainId) {
    return (await createWeb3(chainId)).eth.estimateGas(config)
}
