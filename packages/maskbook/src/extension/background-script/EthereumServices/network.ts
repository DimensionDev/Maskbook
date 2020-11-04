import * as Maskbook from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import type { ChainId } from '../../../web3/types'

export async function getGasPrice(chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getGasPrice()
}

export async function getBlockNumber(chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getBlockNumber()
}

export async function getBalance(address: string, chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getBalance(address)
}

export async function getTransaction(id: string, chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getTransaction(id)
}

export async function getTransactionReceipt(id: string, chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getTransactionReceipt(id)
}

export async function getTransactionCount(address: string, chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.getTransactionCount(address)
}

export async function estimateGas(config: TransactionConfig, chainId: ChainId) {
    return Maskbook.createWeb3(chainId).eth.estimateGas(config)
}
