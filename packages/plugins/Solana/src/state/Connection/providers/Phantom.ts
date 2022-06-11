import bs58 from 'bs58'
import { PublicKey, Transaction } from '@solana/web3.js'
import { injectedPhantomProvider } from '@masknet/injected-script'
import { PhantomMethodType, ProviderType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class PhantomProvider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        injectedPhantomProvider.untilAvailable().then(() => {
            injectedPhantomProvider.connect({
                onlyIfTrusted: true,
            })
        })

        super(ProviderType.Phantom, injectedPhantomProvider)
    }

    override async signMessage(dataToSign: string) {
        const { signature } = await this.bridge.request<{
            publicKey: string
            signature: string
        }>({
            method: PhantomMethodType.SIGN_MESSAGE,
            params: {
                message: new TextEncoder().encode(dataToSign),
                display: 'hex',
            },
        })
        return signature
    }

    override async signTransaction(transaction: Transaction) {
        const { publicKey, signature } = await this.bridge.request<{ publicKey: string; signature: string }>({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                message: bs58.encode(transaction.serializeMessage()),
            },
        })

        transaction.addSignature(new PublicKey(publicKey), bs58.decode(signature))
        return transaction
    }

    override async signTransactions(transactions: Transaction[]) {
        return this.bridge.request<Transaction[]>({
            method: 'signAllTransactions',
            params: {
                message: transactions.map((transaction) => {
                    return bs58.encode(transaction.serializeMessage())
                }),
            },
        })
    }
}
