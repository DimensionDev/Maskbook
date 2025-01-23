import {
    OKXMethodType,
    ProviderType,
    recoverTransactionFromUnit8Array,
    serializeTransaction,
    type Transaction,
    type Web3Provider,
} from '@masknet/web3-shared-solana'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'
import { injectedOKXSolanaProvider, type InjectedWalletBridge } from '@masknet/injected-script'
import { decode, encode } from 'bs58'

export class SolanaOKXProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.OKX
    protected override bridge: InjectedWalletBridge = injectedOKXSolanaProvider

    private async validateSession() {
        if (this.bridge.isConnected) return
        await (this.bridge as unknown as Web3Provider).connect()
    }

    override async setup() {
        if (!injectedOKXSolanaProvider.isReady) return
        await injectedOKXSolanaProvider.untilAvailable()
        super.setup()
    }

    override async signMessage(message: string) {
        await this.validateSession()
        const { signature } = await this.bridge.request<{
            publicKey: string
            signature: string
        }>({
            method: OKXMethodType.SIGN_MESSAGE,
            params: {
                message: new TextEncoder().encode(message),
                display: 'hex',
            },
        })
        return signature
    }

    override async signTransaction(transaction: Transaction) {
        await this.validateSession()

        const result = await this.bridge.request<{
            serializedTransaction: string
        }>({
            method: OKXMethodType.SIGN_TRANSACTION,
            params: {
                transaction: encode(serializeTransaction(transaction)),
                type: 'serializeMessage' in transaction ? 'transaction' : 'versionedTransaction',
            },
        })

        const signedTransaction = decode(result.serializedTransaction)

        return recoverTransactionFromUnit8Array(signedTransaction, transaction)
    }

    override async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        await this.validateSession()
        const results = await this.bridge.request<{ transactions: string[] }>({
            method: OKXMethodType.SIGN_ALL_TRANSACTIONS,
            params: {
                message: transactions.map((transaction) => {
                    return {
                        transaction: encode(serializeTransaction(transaction)),
                        type: 'serializeMessage' in transaction ? 'transaction' : 'versionedTransaction',
                    }
                }),
            },
        })

        return results.transactions.map((signedTransaction, index) => {
            const transaction = transactions[index]
            return recoverTransactionFromUnit8Array(decode(signedTransaction), transaction)
        })
    }
}
