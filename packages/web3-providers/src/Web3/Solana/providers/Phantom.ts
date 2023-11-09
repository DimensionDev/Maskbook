import bs58 from 'bs58'
import { PublicKey, type Transaction } from '@solana/web3.js'
import { injectedPhantomProvider } from '@masknet/injected-script'
import { PhantomMethodType, ProviderType, type Web3Provider } from '@masknet/web3-shared-solana'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaPhantomProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Phantom
    protected override bridge = injectedPhantomProvider
    private async validateSession() {
        if (this.bridge.isConnected) return
        await (this.bridge as unknown as Web3Provider).connect()
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
