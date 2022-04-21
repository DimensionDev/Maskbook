import bs58 from 'bs58'
import { PhantomMethodType } from '@masknet/web3-shared-solana'
import type { Transaction } from '@solana/web3.js'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class PhantomProvider extends BaseInjectedProvider implements SolanaProvider {
    private get phantomProvider() {
        if (!this.provider) throw new Error('No connection.')
        return this.provider
    }

    override signMessage(dataToSign: string) {
        return this.phantomProvider.request<string>({
            method: PhantomMethodType.SIGN_MESSAGE,
            params: {
                message: new TextEncoder().encode(dataToSign),
                display: 'hex',
            },
        })
    }

    override signTransaction(transaction: Transaction) {
        return this.phantomProvider.request<Transaction>({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                mesasage: bs58.encode(transaction.serializeMessage()),
            },
        })
    }

    override async signTransactions(transactions: Transaction[]) {
        return this.phantomProvider.request<Transaction[]>({
            method: 'signAllTransactions',
            params: {
                message: transactions.map((transaction) => {
                    return bs58.encode(transaction.serializeMessage())
                }),
            },
        })
    }
}
