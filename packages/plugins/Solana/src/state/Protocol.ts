import type Web3 from '@solana/web3.js'
import { first } from 'lodash-unified'
import type { TransactionConfig } from 'web3-core'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-solana'
import { SolanaRPC } from '../messages'

export class Protocol
    implements Web3Plugin.ObjectCapabilities.ProtocolState<ChainId, string, TransactionConfig, {}, {}, typeof Web3>
{
    constructor(private context: Plugin.Shared.SharedContext) {}

    async getAccount() {
        const accounts = await SolanaRPC.getAccounts()
        return first(accounts) ?? ''
    }
    async getChainId() {
        const hex = await SolanaRPC.getChainId()
        return Number.parseInt(hex, 16)
    }
    getLatestBalance(chainId: ChainId, account: string) {
        return SolanaRPC.getBalance(account, {
            account,
            chainId,
        })
    }
    getLatestBlockNumber(chainId: ChainId) {
        return SolanaRPC.getBlockNumber({
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
                return SolanaRPC.personalSign(message, address, '')
            case 'typedData':
                return SolanaRPC.typedDataSign(address, message)
            default:
                throw new Error(`Unknown sign type: ${signType}`)
        }
    }
    signTransaction(address: string, transaction: TransactionConfig) {
        return this.context.signTransaction(address, transaction)
    }
    async getTransactionStatus(chainId: ChainId, id: string) {
        const receipt = await SolanaRPC.getTransactionReceipt(id, {
            chainId,
        })
        return getReceiptStatus(receipt)
    }

    async sendTransaction(chainId: ChainId, transaction: TransactionConfig) {
        if (!transaction.from) throw new Error('An invalid transaction.')
        const rawTransaction = await this.signTransaction(transaction.from as string, transaction)
        const txHash = await SolanaRPC.sendRawTransaction(rawTransaction, {
            chainId,
        })

        return txHash
    }
    async sendSignedTransaction(chainId: ChainId, rawTransaction: string) {
        const txHash = await SolanaRPC.sendRawTransaction(rawTransaction, {
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
