import { createWeb3 } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import type { ChainId } from '../../../web3/types'
import { getWallet } from '../../../plugins/Wallet/services'

export async function getGasPrice(chainId: ChainId) {
    return createWeb3(chainId).eth.getGasPrice()
}

export async function getBlockNumber(chainId: ChainId) {
    return createWeb3(chainId).eth.getBlockNumber()
}

export async function getBalance(address: string, chainId: ChainId) {
    return createWeb3(chainId).eth.getBalance(address)
}

export async function getTransaction(id: string, chainId: ChainId) {
    return createWeb3(chainId).eth.getTransaction(id)
}

export async function getTransactionReceipt(id: string, chainId: ChainId) {
    return createWeb3(chainId).eth.getTransactionReceipt(id)
}

export async function getTransactionCount(address: string, chainId: ChainId) {
    return createWeb3(chainId).eth.getTransactionCount(address)
}

export async function estimateGas(config: TransactionConfig, chainId: ChainId) {
    return createWeb3(chainId).eth.estimateGas(config)
}

export async function sign(data: string, address: string, chainId: ChainId) {
    const wallet = await getWallet(address)
    if (!wallet?._private_key_) throw new Error('cannot sign with given wallet')
    return createWeb3(chainId, [wallet._private_key_]).eth.sign(data, address)
}
