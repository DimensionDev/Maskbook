import { createWeb3 } from './web3'
import { createProvider } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import type { ChainId } from '../../../web3/types'

async function createWeb3Instance(chainId: ChainId) {
    const provider = createProvider(chainId)
    return createWeb3(provider.host, provider)
}

export async function getGasPrice(chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getGasPrice()
}

export async function getBlockNumber(chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getBlockNumber()
}

export async function getBalance(address: string, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getBalance(address)
}

export async function getTransaction(id: string, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getTransaction(id)
}

export async function getTransactionReceipt(id: string, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getTransactionReceipt(id)
}

export async function getTransactionCount(address: string, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.getTransactionCount(address)
}

export async function estimateGas(config: TransactionConfig, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.estimateGas(config)
}

export async function sign(data: string, address: string, chainId: ChainId) {
    return (await createWeb3Instance(chainId)).eth.sign(data, address)
}
