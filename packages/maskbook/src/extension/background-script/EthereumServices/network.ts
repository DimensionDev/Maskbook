import type {
    SignedTransaction,
    Transaction,
    TransactionConfig,
    TransactionReceipt,
    PastLogsOptions,
    Log,
} from 'web3-core'
import { toHex } from 'web3-utils'
import { ChainId, EthereumChainDetailed, EthereumMethodType } from '@masknet/web3-shared-evm'
import { request } from './request'
import type { SendOverrides } from './send'

export async function getAccounts(overrides?: SendOverrides) {
    return request<string[]>(
        {
            method: EthereumMethodType.ETH_ACCOUNTS,
        },
        overrides,
    )
}

export async function getCode(address: string, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GET_CODE,
            params: [address, 'latest'],
        },
        overrides,
    )
}

export async function getGasPrice(overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GAS_PRICE,
        },
        overrides,
    )
}

export async function getBlockNumber(overrides?: SendOverrides) {
    const blockNumber = await request<string>(
        {
            method: EthereumMethodType.ETH_BLOCK_NUMBER,
        },
        overrides,
    )
    return Number.parseInt(blockNumber, 16) || 0
}

export async function getBalance(address: string, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_GET_BALANCE,
            params: [address, 'latest'],
        },
        overrides,
    )
}

export async function getTransactionByHash(hash: string, overrides?: SendOverrides) {
    return request<Transaction>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
            params: [hash],
        },
        overrides,
    )
}

export async function getTransactionReceipt(hash: string, overrides?: SendOverrides) {
    return request<TransactionReceipt | null>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
            params: [hash],
        },
        overrides,
    )
}

export async function getTransactionCount(address: string, overrides?: SendOverrides) {
    const count = await request<string>(
        {
            method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
            params: [address, 'latest'],
        },
        overrides,
    )
    return Number.parseInt(count, 16) || 0
}

export async function call(config: TransactionConfig, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_CALL,
            params: [config, 'latest'],
        },
        overrides,
    )
}

export async function estimateGas(config: TransactionConfig, overrides?: SendOverrides) {
    const gas = await request<string>(
        {
            method: EthereumMethodType.ETH_ESTIMATE_GAS,
            params: [config],
        },
        overrides,
    )
    return Number.parseInt(gas, 16) || 0
}

export async function sign(dataToSign: string, address: string, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_SIGN,
            params: [dataToSign, address],
        },
        overrides,
    )
}

export async function personalSign(dataToSign: string, address: string, password?: string, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.PERSONAL_SIGN,
            params: [dataToSign, address, password].filter((x) => typeof x !== 'undefined'),
        },
        overrides,
    )
}

export async function addEthereumChain(
    chainDetailed: EthereumChainDetailed,
    address?: string,
    overrides?: SendOverrides,
) {
    return request<boolean>(
        {
            method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
            params: [chainDetailed, address].filter(Boolean),
        },
        overrides,
    )
}

export async function switchEthereumChain(chainId: ChainId, overrides?: SendOverrides) {
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
    )
}

export async function signTransaction(config: TransactionConfig, overrides?: SendOverrides) {
    return request<SignedTransaction>(
        {
            method: EthereumMethodType.ETH_SIGN_TRANSACTION,
            params: [config],
        },
        overrides,
    )
}

export async function sendTransaction(config: TransactionConfig, overrides?: SendOverrides) {
    return request<string>(
        {
            method: EthereumMethodType.ETH_SEND_TRANSACTION,
            params: [config],
        },
        overrides,
    )
}

export async function getPastLogs(config: PastLogsOptions, overrides?: SendOverrides) {
    return new Promise<Log[]>((resolve, reject) =>
        request<Log[]>(
            {
                method: EthereumMethodType.ETH_GET_LOGS,
                params: [config],
            },
            overrides,
        )
            .then((result) => resolve(result))
            .catch(() => resolve([])),
    )
}
