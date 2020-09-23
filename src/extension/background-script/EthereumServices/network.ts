import { createWeb3 } from './web3'
import { createProvider } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import { getChainId } from './chainId'

async function createWeb3Instance() {
    return createWeb3(createProvider(await getChainId()))
}

export async function getGasPrice() {
    return (await createWeb3Instance()).eth.getGasPrice()
}

export async function getBlockNumber() {
    return (await createWeb3Instance()).eth.getBlockNumber()
}

export async function getBalance(address: string) {
    return (await createWeb3Instance()).eth.getBalance(address)
}

export async function getTransaction(id: string) {
    return (await createWeb3Instance()).eth.getTransaction(id)
}

export async function getTransactionReceipt(id: string) {
    return (await createWeb3Instance()).eth.getTransactionReceipt(id)
}

export async function getTransactionCount(address: string) {
    return (await createWeb3Instance()).eth.getTransactionCount(address)
}

export async function estimateGas(config: TransactionConfig) {
    return (await createWeb3Instance()).eth.estimateGas(config)
}
