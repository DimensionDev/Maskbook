import type { SignedTransaction, Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import { EthereumChainDetailed, EthereumMethodType } from '@masknet/web3-shared'
import { request } from './request'

export async function getGasPrice() {
    return request<string>({
        method: EthereumMethodType.ETH_GAS_PRICE,
    })
}

export async function getBlockNumber() {
    const blockNumber = await request<string>({
        method: EthereumMethodType.ETH_BLOCK_NUMBER,
    })
    return Number.parseInt(blockNumber, 16)
}

export async function getBalance(address: string) {
    return request<string>({
        method: EthereumMethodType.ETH_GET_BALANCE,
        params: [address, 'latest'],
    })
}

export async function getTransactionByHash(hash: string) {
    return request<Transaction>({
        method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        params: [hash],
    })
}

export async function getTransactionReceipt(hash: string) {
    return request<TransactionReceipt | null>({
        method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        params: [hash],
    })
}

export async function getTransactionCount(address: string) {
    const count = await request<string>({
        method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        params: [address, 'latest'],
    })
    return Number.parseInt(count, 16)
}

export async function estimateGas(config: TransactionConfig) {
    const gas = await request<string>({
        method: EthereumMethodType.ETH_ESTIMATE_GAS,
        params: [config],
    })
    return Number.parseInt(gas, 16)
}

export async function sign(dataToSign: string, address: string) {
    return request<string>({
        method: EthereumMethodType.ETH_SIGN,
        params: [dataToSign, address],
    })
}

export async function personalSign(dataToSign: string, address: string, password?: string) {
    return request<string>({
        method: EthereumMethodType.PERSONAL_SIGN,
        params: [dataToSign, address, password].filter((x) => typeof x !== 'undefined'),
    })
}

export async function addEthereumChain(chainDetailed: EthereumChainDetailed, address?: string) {
    return request<boolean>({
        method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
        params: [chainDetailed, address].filter(Boolean),
    })
}

export async function signTransaction(config: TransactionConfig) {
    return request<SignedTransaction>({
        method: EthereumMethodType.ETH_SIGN_TRANSACTION,
        params: [config],
    })
}
