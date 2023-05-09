import bs58 from 'bs58'
import { PublicKey, type Transaction } from '@solana/web3.js'
import { injectedPhantomProvider } from '@masknet/injected-script'
import {
    type ChainId,
    PhantomMethodType,
    ProviderType,
    type Web3,
    type Web3Provider,
} from '@masknet/web3-shared-solana'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class PhantomProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.Phantom, injectedPhantomProvider)
    }

    private async validateSession() {
        if (this.bridge.isConnected) return
        await this.bridge.connect(undefined)
    }

    override async setup(): Promise<void> {
        if (!injectedPhantomProvider.isReady) return
        await injectedPhantomProvider.untilAvailable()
        await super.setup()
    }

    override async signMessage(message: string) {
        await this.validateSession()
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
        await this.validateSession()
        const { publicKey, signature } = await this.bridge.request<{
            publicKey: string
            signature: string
        }>({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                message: bs58.encode(transaction.serializeMessage()),
            },
        })

        transaction.addSignature(new PublicKey(publicKey), Buffer.from(bs58.decode(signature)))
        return transaction
    }

    override async signTransactions(transactions: Transaction[]) {
        await this.validateSession()
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
