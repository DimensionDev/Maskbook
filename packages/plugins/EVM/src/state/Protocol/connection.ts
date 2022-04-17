import { first } from 'lodash-unified'
import { toHex } from 'web3-utils'
import type { RequestArguments, SignedTransaction, Transaction, TransactionReceipt } from 'web3-core'
import {
    ChainId,
    EthereumMethodType,
    getChainDetailedCAIP,
    ProviderType,
    getReceiptStatus,
    EthereumTransactionConfig,
} from '@masknet/web3-shared-evm'
import type { TransactionStatusType, Web3Plugin } from '@masknet/plugin-infra/web3'
import { createContext, dispatch } from './composer'
import { Providers } from './provider'
import type { Connection as BaseConnection, RequestOptions } from './types'

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
        return <T extends unknown>(requestArguments: RequestArguments, options?: RequestOptions) => {
            return new Promise<T>(async (resolve, reject) => {
                const context = createContext(this, requestArguments, {
                    account: this.account,
                    chainId: this.chainId,
                    providerType: this.providerType,
                    popupsWindow: true,
                    ...options,
                })

                try {
                    await dispatch(context, async () => {
                        if (!context.writeable) return
                        try {
                            const web3Provider = await Providers[
                                isUniversalMethod(context.method) ? ProviderType.MaskWallet : this.providerType
                            ].createWeb3Provider(this.chainId)

                            // send request and set result in the context
                            context.write((await web3Provider.request(context.requestArguments)) as T)
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

    getWeb3(options?: RequestOptions) {
        return Providers[options?.providerType ?? this.providerType].createWeb3(options?.chainId ?? this.chainId)
    }

    async getAccount(options?: RequestOptions) {
        const accounts = await this.hijackedRequest<string[]>(
            {
                method: EthereumMethodType.ETH_ACCOUNTS,
            },
            options,
        )
        return first(accounts) ?? ''
    }

    async getChainId(options?: RequestOptions) {
        const chainId = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CHAIN_ID,
            },
            options,
        )
        return Number.parseInt(chainId, 16)
    }

    getBlockNumber(options?: RequestOptions) {
        return this.hijackedRequest<number>(
            {
                method: EthereumMethodType.ETH_BLOCK_NUMBER,
            },
            options,
        )
    }

    getBalance(address: string, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_BALANCE,
                params: [address],
            },
            options,
        )
    }

    getCode(address: string, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_CODE,
                params: [address, 'latest'],
            },
            options,
        )
    }

    async getTransaction(hash: string, options?: RequestOptions) {
        return this.hijackedRequest<Transaction>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_BY_HASH,
                params: [hash],
            },
            options,
        )
    }

    getTransactionReceiptHijacked(hash: string, options?: RequestOptions) {
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            options,
        )
    }

    getTransactionReceipt(hash: string, options?: RequestOptions) {
        return this.hijackedRequest<TransactionReceipt | null>(
            {
                method: EthereumMethodType.MASK_GET_TRANSACTION_RECEIPT,
                params: [hash],
            },
            options,
        )
    }

    async getTransactionStatus(id: string, options?: RequestOptions): Promise<TransactionStatusType> {
        const receipt = await this.getTransactionReceiptHijacked(id, options)
        return getReceiptStatus(receipt)
    }

    async getTransactionNonce(address: string, options?: RequestOptions) {
        const count = await this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_GET_TRANSACTION_COUNT,
                params: [address, 'latest'],
            },
            options,
        )
        return Number.parseInt(count, 16) || 0
    }

    call(transaction: EthereumTransactionConfig, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_CALL,
                params: [transaction, 'latest'],
            },
            options,
        )
    }

    signMessage(
        dataToSign: string,
        signType?: 'personaSign' | 'typedDataSign' | Omit<string, 'personaSign' | 'typedDataSign'>,
        options?: RequestOptions,
    ) {
        if (!options?.account) throw new Error('Unknown account.')

        switch (signType) {
            case 'personaSign':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.PERSONAL_SIGN,
                        params: [dataToSign, options.account, ''].filter((x) => typeof x !== 'undefined'),
                    },
                    options,
                )
            case 'typedDataSign':
                return this.hijackedRequest<string>(
                    {
                        method: EthereumMethodType.ETH_SIGN_TYPED_DATA,
                        params: [options.account, dataToSign],
                    },
                    options,
                )
            default:
                throw new Error(`Unknown sign type: ${signType}.`)
        }
    }

    async verifyMessage(
        dataToVerify: string,
        signature: string,
        signType?: string,
        options?: Web3Plugin.ConnectionOptions<ChainId, ProviderType, EthereumTransactionConfig>,
    ) {
        const web3 = await this.getWeb3(options)
        const dataToSign = await web3.eth.personal.ecRecover(dataToVerify, signature)
        return dataToSign === dataToVerify
    }

    addChain(chainId: ChainId, options?: RequestOptions) {
        const chainDetailed = getChainDetailedCAIP(chainId)
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.WALLET_ADD_ETHEREUM_CHAIN,
                params: [chainDetailed].filter(Boolean),
            },
            options,
        )
    }

    switchChain(chainId: ChainId, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.WALLET_SWITCH_ETHEREUM_CHAIN,
                params: [
                    {
                        chainId: toHex(chainId),
                    },
                ],
            },
            options,
        )
    }

    async signTransaction(transaction: EthereumTransactionConfig, options?: RequestOptions) {
        const signed = await this.hijackedRequest<SignedTransaction>(
            {
                method: EthereumMethodType.ETH_SIGN_TRANSACTION,
                params: [transaction],
            },
            options,
        )
        return signed.rawTransaction ?? ''
    }

    signTransactions(transactions: EthereumTransactionConfig[], options?: RequestOptions) {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }

    sendTransaction(transaction: EthereumTransactionConfig, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_TRANSACTION,
                params: [transaction],
            },
            options,
        )
    }

    sendSignedTransaction(signature: string, options?: RequestOptions) {
        return this.hijackedRequest<string>(
            {
                method: EthereumMethodType.ETH_SEND_RAW_TRANSACTION,
                params: [signature],
            },
            options,
        )
    }

    watchTransaction(hash: string, transaction: EthereumTransactionConfig, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_WATCH_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    unwatchTransaction(hash: string, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_UNWATCH_TRANSACTION,
                params: [hash],
            },
            options,
        )
    }

    confirmRequest(options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_CONFIRM_TRANSACTION,
                params: [],
            },
            options,
        )
    }

    rejectRequest(options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REJECT_TRANSACTION,
                params: [],
            },
            options,
        )
    }

    replaceRequest(hash: string, transaction: EthereumTransactionConfig, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [hash, transaction],
            },
            options,
        )
    }

    cancelRequest(hash: string, transaction: EthereumTransactionConfig, options?: RequestOptions) {
        return this.hijackedRequest<void>(
            {
                method: EthereumMethodType.MASK_REPLACE_TRANSACTION,
                params: [
                    hash,
                    {
                        ...transaction,
                        to: transaction.from,
                        data: '0x0',
                        value: '0x0',
                    },
                ],
            },
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
