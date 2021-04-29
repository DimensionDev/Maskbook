import type { SignedTransaction, Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import { request } from './request'

export async function getGasPrice() {
    return request<string>({
        method: 'eth_gasPrice',
    })
}

export async function getBlockNumber() {
    const blockNumber = await request<string>({
        method: 'eth_blockNumber',
    })
    return Number.parseInt(blockNumber, 16)
}

export async function getBalance(address: string) {
    return request<string>({
        method: 'eth_getBalance',
        params: [address, 'latest'],
    })
}

export async function getTransactionByHash(hash: string) {
    return request<Transaction>({
        method: 'eth_getTransactionByHash',
        params: [hash],
    })
}

export async function getTransactionReceipt(hash: string) {
    return request<TransactionReceipt>({
        method: 'eth_getTransactionReceipt',
        params: [hash],
    })
}

export async function getTransactionCount(address: string) {
    const count = await request<string>({
        method: 'eth_getTransactionCount',
        params: [address, 'latest'],
    })
    return Number.parseInt(count, 16)
}

export async function estimateGas(config: TransactionConfig) {
    const gas = await request<string>({
        method: 'eth_estimateGas',
        params: [config],
    })
    return Number.parseInt(gas, 16)
}

export async function sign(dataToSign: string, address: string) {
    return request<string>({
        method: 'eth_sign',
        params: [dataToSign, address],
    })
}

export async function personalSign(dataToSign: string, address: string, password?: string) {
    return request<string>({
        method: 'personal_sign',
        params: [dataToSign, address, password].filter(Boolean),
    })
}

export async function signTransaction(config: TransactionConfig) {
    return request<SignedTransaction>({
        method: 'eth_signTransaction',
        params: [config],
    })
}
