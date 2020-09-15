import { createWeb3 } from './web3'
import { createProvider } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import { ChainId } from '../../../web3/types'

export async function getChainId() {
    return ChainId.Mainnet
}

export function getGasPrice() {
    return createWeb3(createProvider()).eth.getGasPrice()
}

export function getBlockNumber() {
    return createWeb3(createProvider()).eth.getBlockNumber()
}

export function getBalance(address: string) {
    return createWeb3(createProvider()).eth.getBalance(address)
}

export function getTransactionReceipt(id: string) {
    return createWeb3(createProvider()).eth.getTransactionReceipt(id)
}

export function getTransactionCount(address: string) {
    return createWeb3(createProvider()).eth.getTransactionCount(address)
}

export function estimateGas(from: string, config: TransactionConfig) {
    return createWeb3(createProvider()).eth.estimateGas({
        from,
        ...config,
    })
}
