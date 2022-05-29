import bs58 from 'bs58'
import type { Transaction } from '@solana/web3.js'
import { injectedPhantomProvider } from '@masknet/injected-script'
import { PhantomMethodType, ProviderType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class PhantomProvider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        super(ProviderType.Phantom, injectedPhantomProvider)
    }

    override signMessage(dataToSign: string) {
        return this.bridge.request({
            method: PhantomMethodType.SIGN_MESSAGE,
            params: {
                message: new TextEncoder().encode(dataToSign),
                display: 'hex',
            },
        }) as Promise<string>
    }

    override signTransaction(transaction: Transaction) {
        return this.bridge.request({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                message: bs58.encode(transaction.serializeMessage()),
            },
        }) as Promise<Transaction>
    }

    override async signTransactions(transactions: Transaction[]) {
        return this.bridge.request({
            method: 'signAllTransactions',
            params: {
                message: transactions.map((transaction) => {
                    return bs58.encode(transaction.serializeMessage())
                }),
            },
        }) as Promise<Transaction[]>
    }
}
