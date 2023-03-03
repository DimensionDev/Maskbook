import bs58 from 'bs58'
import { PublicKey, type Transaction } from '@solana/web3.js'
import { injectedPhantomProvider } from '@masknet/injected-script'
import { PhantomMethodType, ProviderType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types.js'
import { BaseInjectedProvider } from './BaseInjected.js'

export class PhantomProvider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        super(ProviderType.Phantom, injectedPhantomProvider)
        injectedPhantomProvider.untilAvailable().then(async () => {
            await injectedPhantomProvider.connect({
                onlyIfTrusted: true,
            })
        })
    }

    override async signMessage(message: string) {
        const { signature } = await this.bridge.request<{
            publicKey: string
            signature: string
        }>({
            method: PhantomMethodType.SIGN_MESSAGE,
            params: {
                message: new TextEncoder().encode(message),
                display: 'hex',
            },
        })
        return signature
    }

    override async signTransaction(transaction: Transaction) {
        const { publicKey, signature } = await this.bridge.request<{
            publicKey: string
            signature: string
        }>({
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
