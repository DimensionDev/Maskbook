import { injectedSolflareProvider, type InjectedWalletBridge } from '@masknet/injected-script'
import {
    ProviderType,
    recoverTransactionFromUnit8Array,
    serializeTransaction,
    SolflareMethodType,
    type Transaction,
    type Web3Provider,
} from '@masknet/web3-shared-solana'

import { SolanaInjectedWalletProvider } from './BaseInjected.js'
import { decode, encode } from 'bs58'

export class SolanaSolflareProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Solflare
    protected override bridge: InjectedWalletBridge = injectedSolflareProvider
    private async validateSession() {
        if (this.bridge.isConnected) return
        await (this.bridge as unknown as Web3Provider).connect()
    }
    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        await this.validateSession()
        const result = await this.bridge.request<{
            transaction: string
        }>({
            method: SolflareMethodType.SIGN_TRANSACTION,
            params: {
                transaction: encode(serializeTransaction(transaction)),
            },
        })

        const signedTransaction = decode(result.transaction)

        return recoverTransactionFromUnit8Array(signedTransaction, transaction)
    }

    override async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        await this.validateSession()
        const results = await this.bridge.request<{ transactions: string[] }>({
            method: SolflareMethodType.SIGN_TRANSACTIONS,
            params: {
                transactions: transactions.map((transaction) => encode(serializeTransaction(transaction))),
            },
        })

        return results.transactions.map((signedTransaction, index) => {
            const transaction = transactions[index]
            return recoverTransactionFromUnit8Array(decode(signedTransaction), transaction)
        })
    }

    override signMessage(message: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
