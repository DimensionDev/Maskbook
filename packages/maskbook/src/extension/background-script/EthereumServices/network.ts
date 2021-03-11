import type { TransactionRequest } from '@ethersproject/providers'
import * as Maskbook from './providers/Maskbook'
import type { ChainId } from '../../../web3/types'

export function getGasPrice(chainId: ChainId) {
    return Maskbook.createProvider(chainId).getGasPrice()
}

export async function getBlockNumber(chainId: ChainId) {
    return Maskbook.createProvider(chainId).getBlockNumber()
}

export async function getBalance(address: string, chainId: ChainId) {
    return Maskbook.createProvider(chainId).getBalance(address)
}

export async function getTransaction(id: string, chainId: ChainId) {
    return Maskbook.createProvider(chainId).getTransaction(id)
}

export async function getTransactionReceipt(id: string, chainId: ChainId) {
    return Maskbook.createProvider(chainId).getTransactionReceipt(id)
}

export async function getTransactionCount(address: string, chainId: ChainId) {
    return Maskbook.createProvider(chainId).getTransactionCount(address)
}

export async function estimateGas(request: TransactionRequest, chainId: ChainId) {
    return Maskbook.createProvider(chainId).estimateGas(request)
}
