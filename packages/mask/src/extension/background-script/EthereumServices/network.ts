import type {
    SignedTransaction,
    Transaction,
    TransactionConfig,
    TransactionReceipt,
    PastLogsOptions,
    Log,
} from 'web3-core'
import { toHex } from 'web3-utils'
import {
    ChainId,
    EthereumChainDetailed,
    EthereumMethodType,
    RequestOptions,
    SendOverrides,
} from '@masknet/web3-shared-evm'
import { request } from './request'

export async function getChainId(overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_CHAIN_ID,
        },
        overrides,
        options,
    )
}

export async function getAccounts(overrides?: SendOverrides, options?: RequestOptions) {
    return request<string[]>(
        {
            method: EthereumMethodType.ETH_ACCOUNTS,
        },
        overrides,
        options,
    )
}

export async function getCode(address: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GET_CODE,
            params: [address, 'latest'],
        },
        overrides,
        options,
    )
}

export async function getGasPrice(overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GAS_PRICE,
        },
        overrides,
        options,
    )
}

export async function getBlockNumber(overrides?: SendOverrides, options?: RequestOptions) {
    const blockNumber = await request<string>(
        {
            method: EthereumMethodType.ETH_BLOCK_NUMBER,
        },
        overrides,
        options,
    )
    return Number.parseInt(blockNumber, 16) || 0
}

export async function getBalance(address: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GET_BALANCE,
            params: [address, 'latest'],
        },
        overrides,
        options,
    )
}

export async function getTransactionByHash(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<Transaction>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
            params: [hash],
        },
        overrides,
        options,
    )
}

export async function getTransactionReceiptHijacked(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<TransactionReceipt | null>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
            params: [hash],
        },
        overrides,
        options,
    )
}

export async function getTransactionReceipt(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<TransactionReceipt | null>(
        {
            method: EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT,
            params: [hash],
        },
        overrides,
        options,
    )
}

export async function getTransactionCount(address: string, overrides?: SendOverrides, options?: RequestOptions) {
    const count = await request<string>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
            params: [address, 'latest'],
        },
        overrides,
        options,
    )
    return Number.parseInt(count, 16) || 0
}

export async function getPendingTransactions(address: string, overrides?: SendOverrides, options?: RequestOptions) {
    const filterId = await request<string>(
        {
            method: EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
            params: [],
        },
        overrides,
        options,
    )
    const transactions = await request<string[]>(
        {
            method: EthereumMethodType.ETH_GET_FILTER_CHANGES,
            params: [filterId],
        },
        overrides,
        options,
    )
    return transactions
}

export async function call(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_CALL,
            params: [config, 'latest'],
        },
        overrides,
        options,
    )
}

export async function estimateGas(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
    const gas = await request<string>(
        {
            method: EthereumMethodType.ETH_ESTIMATE_GAS,
            params: [config],
        },
        overrides,
        options,
    )
    return Number.parseInt(gas, 16) || 0
}

export async function sign(dataToSign: string, address: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_SIGN,
            params: [dataToSign, address],
        },
        overrides,
        options,
    )
}

export async function personalSign(
    dataToSign: string,
    address: string,
    password?: string,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<string>(
        {
            method: EthereumMethodType.PERSONAL_SIGN,
            params: [dataToSign, address, password].filter((x) => typeof x !== 'undefined'),
        },
        overrides,
        options,
    )
}

export async function typedDataSign(
    address: string,
    dataToSign: string,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
            params: [address, dataToSign],
        },
        overrides,
        options,
    )
}

export async function addEthereumChain(
    chainDetailed: EthereumChainDetailed,
    address?: string,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<boolean>(
        {
            method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
            params: [chainDetailed, address].filter(Boolean),
        },
        overrides,
        options,
    )
}

export async function switchEthereumChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions) {
    return request<boolean>(
        {
            method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
            params: [
                {
                    chainId: toHex(chainId),
                },
            ],
        },
        overrides,
        options,
    )
}

export async function signTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
    return request<SignedTransaction>(
        {
            method: EthereumMethodType.ETH_SIGN_TRANSACTION,
            params: [config],
        },
        overrides,
        options,
    )
}

export async function sendTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
    return request<void>(
        {
            method: EthereumMethodType.ETH_SEND_TRANSACTION,
            params: [config],
        },
        overrides,
        options,
    )
}

export async function sendRawTransaction(raw: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
            params: [raw],
        },
        overrides,
        options,
    )
}

export async function getPastLogs(config: PastLogsOptions, overrides?: SendOverrides, options?: RequestOptions) {
    return new Promise<Log[]>((resolve, reject) =>
        request<Log[]>(
            {
                method: EthereumMethodType.ETH_GET_LOGS,
                params: [config],
            },
            overrides,
            options,
        )
            .then((result) => resolve(result))
            .catch(() => resolve([])),
    )
}

export async function watchTransaction(
    hash: string,
    config: TransactionConfig,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_WATCH_TRANSACTION,
            params: [hash, config],
        },
        overrides,
        options,
    )
}

export async function unwatchTransaction(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_UNWATCH_TRANSACTION,
            params: [hash],
        },
        overrides,
        options,
    )
}

export async function confirmRequest(overrides?: SendOverrides, options?: RequestOptions) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_CONFIRM_TRANSACTION,
            params: [],
        },
        overrides,
        options,
    )
}

export async function rejectRequest(overrides?: SendOverrides, options?: RequestOptions) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_REJECT_TRANSACTION,
            params: [],
        },
        overrides,
        options,
    )
}

export async function replaceRequest(
    hash: string,
    config: TransactionConfig,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
            params: [hash, config],
        },
        overrides,
        options,
    )
}

export async function cancelRequest(
    hash: string,
    config: TransactionConfig,
    overrides?: SendOverrides,
    options?: RequestOptions,
) {
    return request<void>(
        {
            method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
            params: [
                hash,
                {
                    ...config,
                    to: config.from,
                    data: '0x0',
                    value: '0x0',
                },
            ],
        },
        overrides,
        options,
    )
}
