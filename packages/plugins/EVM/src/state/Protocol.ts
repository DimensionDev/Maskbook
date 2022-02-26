import { first } from 'lodash-unified'
import type { TransactionConfig } from 'web3-core'
import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import { ChainId, getReceiptStatus } from '@masknet/web3-shared-evm'
import {
    getAccounts,
    getChainId,
    getBalance,
    getBlockNumber,
    personalSign,
    typedDataSign,
    getTransactionReceipt,
    sendRawTransaction,
} from './Protocol/network'

export class Protocol implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, string, TransactionConfig> {
    constructor(private context: Plugin.Shared.SharedContext) {}

    async getAccount() {
        const accounts = await getAccounts()
        return first(accounts) ?? ''
    }
    async getChainId() {
        const hex = await getChainId()
        return Number.parseInt(hex, 16)
    }
    getLatestBalance(chainId: ChainId, account: string) {
        return getBalance(account, {
            account,
            chainId,
        })
    }
    getLatestBlockNumber(chainId: ChainId) {
        return getBlockNumber({
            chainId,
        })
    }
    signMessage(
        address: string,
        message: string,
        signType: string | Omit<string, 'personal' | 'typedData'> = 'personal',
    ) {
        switch (signType) {
            case 'personal':
                return personalSign(message, address, '')
            case 'typedData':
                return typedDataSign(address, message)
            default:
                throw new Error(`Unknown sign type: ${signType}`)
        }
    }
    signTransaction(address: string, transaction: TransactionConfig) {
        return this.context.signTransaction(address, transaction)
    }
    async getTransactionStatus(chainId: ChainId, id: string) {
        const receipt = await getTransactionReceipt(id, {
            chainId,
        })
        return getReceiptStatus(receipt)
    }

    async sendTransaction(chainId: ChainId, transaction: TransactionConfig) {
        if (!transaction.from) throw new Error('An invalid transaction.')
        const rawTransaction = await this.signTransaction(transaction.from as string, transaction)
        const txHash = await sendRawTransaction(rawTransaction, {
            chainId,
        })

        return txHash
    }
    async sendSignedTransaction(chainId: ChainId, rawTransaction: string) {
        const txHash = await sendRawTransaction(rawTransaction, {
            chainId,
        })
        return txHash
    }
    async sendAndConfirmTransactions(chainId: ChainId, transaction: TransactionConfig) {
        const txHash = await this.sendTransaction(chainId, transaction)

        // TODO: implement it
        // await waitForConfirmation(hash)
    }
}
