import type Web3 from 'web3'
import { first } from 'lodash-unified'
import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { ProtocolState, Web3Plugin } from '@masknet/plugin-infra/web3'
import {
    ChainId,
    EthereumTransactionConfig,
    getReceiptStatus,
    ProviderType,
    SendOverrides,
    RequestOptions,
} from '@masknet/web3-shared-evm'
import { createConnection } from './Protocol/connection'

export class Protocol
    extends ProtocolState<ChainId, string, EthereumTransactionConfig, SendOverrides, RequestOptions, Web3>
    implements
        Web3Plugin.ObjectCapabilities.ProtocolState<
            ChainId,
            string,
            EthereumTransactionConfig,
            SendOverrides,
            RequestOptions,
            Web3
        >
{
    constructor(
        private context: Plugin.Shared.SharedContext,
        private subscription: {
            account?: Subscription<string>
            chainId?: Subscription<ChainId>
            providerType?: Subscription<ProviderType>
        },
    ) {
        super()
    }

    private createConnection(sendOverrides?: SendOverrides, requestOptions?: RequestOptions) {
        return createConnection(
            sendOverrides?.account ?? this.subscription?.account?.getCurrentValue(),
            sendOverrides?.chainId ?? this.subscription?.chainId?.getCurrentValue(),
            requestOptions?.providerType ?? this.subscription?.providerType?.getCurrentValue(),
        )
    }
    async getWe3(sendOverrides?: SendOverrides, requestOptions?: RequestOptions) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        return connection.getWeb3()
    }

    async getAccount(sendOverrides?: SendOverrides, requestOptions?: RequestOptions) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        const accounts = await connection.getAccounts(sendOverrides, requestOptions)
        return first(accounts) ?? ''
    }
    async getChainId(sendOverrides?: SendOverrides, requestOptions?: RequestOptions) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        const hex = await connection.getChainId(sendOverrides, requestOptions)
        return Number.parseInt(hex, 16)
    }
    getLatestBalance(
        chainId: ChainId,
        account: string,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        return connection.getBalance(
            account,
            {
                account,
                chainId,
                ...sendOverrides,
            },
            requestOptions,
        )
    }
    getLatestBlockNumber(chainId: ChainId, sendOverrides?: SendOverrides, requestOptions?: RequestOptions) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        return connection.getBlockNumber(
            {
                chainId,
                ...sendOverrides,
            },
            requestOptions,
        )
    }
    signMessage(
        address: string,
        message: string,
        signType: string | Omit<string, 'personal' | 'typedData'> = 'personal',
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        switch (signType) {
            case 'personal':
                return connection.personalSign(message, address, '', sendOverrides, requestOptions)
            case 'typedData':
                return connection.typedDataSign(address, message, sendOverrides, requestOptions)
            default:
                throw new Error(`Unknown sign type: ${signType}`)
        }
    }
    signTransaction(
        address: string,
        transaction: EthereumTransactionConfig,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        return connection.signTransaction(transaction, sendOverrides, requestOptions)
    }
    async getTransactionStatus(
        chainId: ChainId,
        id: string,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        const receipt = await connection.getTransactionReceipt(
            id,
            {
                chainId,
                ...sendOverrides,
            },
            requestOptions,
        )
        return getReceiptStatus(receipt)
    }

    async sendTransaction(
        chainId: ChainId,
        transaction: EthereumTransactionConfig,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        if (!transaction.from) throw new Error('An invalid transaction.')
        const connection = this.createConnection(sendOverrides, requestOptions)
        const rawTransaction = await connection.signTransaction(transaction, sendOverrides, requestOptions)
        const txHash = await connection.sendRawTransaction(
            rawTransaction,
            {
                chainId,
                ...sendOverrides,
            },
            requestOptions,
        )

        return txHash
    }
    async sendSignedTransaction(
        chainId: ChainId,
        rawTransaction: string,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const connection = this.createConnection(sendOverrides, requestOptions)
        const txHash = await connection.sendRawTransaction(
            rawTransaction,
            {
                chainId,
                ...sendOverrides,
            },
            requestOptions,
        )
        return txHash
    }
    async sendAndConfirmTransactions(
        chainId: ChainId,
        transaction: EthereumTransactionConfig,
        sendOverrides?: SendOverrides,
        requestOptions?: RequestOptions,
    ) {
        const txHash = await this.sendTransaction(chainId, transaction, sendOverrides, requestOptions)

        // TODO: implement it
        // await waitForConfirmation(hash)
    }
}
