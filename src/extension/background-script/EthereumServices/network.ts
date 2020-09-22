import { createWeb3 } from './web3'
import { createProvider } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import { getChainId } from './chainId'

function createWeb3Instance() {
    return createWeb3(createProvider(getChainId()))
}

export function getGasPrice() {
    return createWeb3Instance().eth.getGasPrice()
}

export function getBlockNumber() {
    return createWeb3Instance().eth.getBlockNumber()
}

export function getBalance(address: string) {
    return createWeb3Instance().eth.getBalance(address)
}

export function getTransaction(id: string) {
    return createWeb3Instance().eth.getTransaction(id)
}

export function getTransactionReceipt(id: string) {
    return createWeb3Instance().eth.getTransactionReceipt(id)
}

export function getTransactionCount(address: string) {
    return createWeb3Instance().eth.getTransactionCount(address)
}

export function estimateGas(config: TransactionConfig) {
    return createWeb3Instance().eth.estimateGas(config)
}
