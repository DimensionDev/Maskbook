import { toHex } from 'web3-utils'
import type { RequestArguments, SignedTransaction, Transaction, TransactionConfig, TransactionReceipt } from 'web3-core'
import {
    ChainId,
    EthereumMethodType,
    RequestOptions,
    SendOverrides,
    getChainDetailedCAIP,
    ProviderType,
} from '@masknet/web3-shared-evm'
import { createContext, dispatch } from './composer'
import { Providers } from './provider'
import type { Connection as BaseConnection } from './types'

function isUniversalMethod(method: EthereumMethodType) {
    return [
        EthereumMethodType.ETH_GET_CODE,
        EthereumMethodType.ETH_GAS_PRICE,
        EthereumMethodType.ETH_BLOCK_NUMBER,
        EthereumMethodType.ETH_GET_BALANCE,
        EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
        EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT,
        EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
        EthereumMethodType.ETH_GET_FILTER_CHANGES,
        EthereumMethodType.ETH_NEW_PENDING_TRANSACTION_FILTER,
        EthereumMethodType.ETH_ESTIMATE_GAS,
        EthereumMethodType.ETH_CALL,
        EthereumMethodType.ETH_GET_LOGS,
    ].includes(method)
}

class Connection implements BaseConnection {
    constructor(private account: string, private chainId: ChainId, private providerType: ProviderType) {}

    // Hijack RPC requests and process them with koa like middlewares
    private get hijackedRequest() {
        return <T extends unknown>(
            requestArguments: RequestArguments,
            overrides?: SendOverrides,
            options?: RequestOptions,
        ) => {
            return new Promise<T>(async (resolve, reject) => {
                const context = createContext(
                    this,
                    requestArguments,
                    {
                        account: this.account,
                        chainId: this.chainId,
                        ...overrides,
                    },
                    {
                        popupsWindow: true,
                        providerType: this.providerType,
                        ...options,
                    },
                )

                try {
                    await dispatch(context, async () => {
                        if (!context.writeable) return
                        try {
                            const externalProvider = Providers[
                                isUniversalMethod(context.method) ? ProviderType.MaskWallet : this.providerType
                            ].createExternalProvider(this.chainId)

                            // send request and set result in the context
                            context.write((await externalProvider.request(context.requestArguments)) as T)
                        } catch (error) {
                            context.abort(error)
                        }
                    })
                } catch (error) {
                    context.abort(error)
                } finally {
                    if (context.error) reject(context.error)
                    else resolve(context.result as T)
                }
            })
        }
    }

    getWeb3() {
        return Providers[this.providerType].createWeb3(this.chainId)
    }

    getAccounts(overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            overrides,
            options,
        )
    }

    getChainId(overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            overrides,
            options,
        )
    }

    getBlockNumber(overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<number>(
            {
                method: EthereumMethodType.ETH_BLOCK_NUMBER,
            },
            overrides,
            options,
        )
    }

    getBalance(address: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_BALANCE,
                params: [address],
            },
            overrides,
            options,
        )
    }

    getCode(address: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_CODE,
                params: [address, 'latest'],
            },
            overrides,
            options,
        )
    }

    getTransactionByHash(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<Transaction>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
                params: [hash],
            },
            overrides,
            options,
        )
    }

    getTransactionReceiptHijacked(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            overrides,
            options,
        )
    }

    getTransactionReceipt(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            overrides,
            options,
        )
    }

    async getTransactionCount(address: string, overrides?: SendOverrides, options?: RequestOptions) {
        const count = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
                params: [address, 'latest'],
            },
            overrides,
            options,
        )
        return Number.parseInt(count, 16) || 0
    }

    call(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL,
                params: [config, 'latest'],
            },
            overrides,
            options,
        )
    }

    personalSign(
        dataToSign: string,
        address: string,
        password?: string,
        overrides?: SendOverrides,
        options?: RequestOptions,
    ) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.PERSONAL_SIGN,
                params: [dataToSign, address, password].filter((x) => typeof x !== 'undefined'),
            },
            overrides,
            options,
        )
    }

    typedDataSign(address: string, dataToSign: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
                params: [address, dataToSign],
            },
            overrides,
            options,
        )
    }

    addChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions) {
        const chainDetailed = getChainDetailedCAIP(chainId)
        return this.hijackedRequest<boolean>(
            {
                method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                params: [chainDetailed].filter(Boolean),
            },
            overrides,
            options,
        )
    }

    switchChain(chainId: ChainId, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<boolean>(
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

    async signTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        const signed = await this.hijackedRequest<SignedTransaction>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [config],
            },
            overrides,
            options,
        )
        return signed.rawTransaction ?? ''
    }

    sendTransaction(config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [config],
            },
            overrides,
            options,
        )
    }

    sendRawTransaction(raw: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                params: [raw],
            },
            overrides,
            options,
        )
    }

    watchTransaction(hash: string, config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_WATCH_TRANSACTION,
                params: [hash, config],
            },
            overrides,
            options,
        )
    }

    unwatchTransaction(hash: string, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_UNWATCH_TRANSACTION,
                params: [hash],
            },
            overrides,
            options,
        )
    }

    confirmRequest(overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_CONFIRM_TRANSACTION,
                params: [],
            },
            overrides,
            options,
        )
    }

    rejectRequest(overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REJECT_TRANSACTION,
                params: [],
            },
            overrides,
            options,
        )
    }

    replaceRequest(hash: string, config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, config],
            },
            overrides,
            options,
        )
    }

    cancelRequest(hash: string, config: TransactionConfig, overrides?: SendOverrides, options?: RequestOptions) {
        return this.hijackedRequest<void>(
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
}

/**
 * Build connection with provider.
 * @param providerType
 * @returns
 */
export function createConnection(account = '', chainId = ChainId.Mainnet, providerType = ProviderType.MaskWallet) {
    return new Connection(account, chainId, providerType)
}
