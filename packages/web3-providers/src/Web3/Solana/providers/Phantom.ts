import { injectedPhantomProvider, type InjectedWalletBridge } from '@masknet/injected-script'
import {
    PhantomMethodType,
    ProviderType,
    recoverTransaction,
    serializeTransaction,
    type Transaction,
    type Web3Provider,
} from '@masknet/web3-shared-solana'
import type * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { encode } from 'bs58'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaPhantomProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Phantom
    protected override bridge: InjectedWalletBridge = injectedPhantomProvider
    private async validateSession() {
        if (this.bridge.isConnected) return
        await (this.bridge as unknown as Web3Provider).connect()
    }

    override async setup() {
        if (!injectedPhantomProvider.isReady) return
        await injectedPhantomProvider.untilAvailable()
        super.setup()
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

        const result = await this.bridge.request<{
            message: SolanaWeb3.MessageArgs | SolanaWeb3.MessageV0Args
            signatures: Uint8Array[]
        }>({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                message: encode(serializeTransaction(transaction)),
            },
        })

        return recoverTransaction(transaction, result.message, result.signatures)
    }

    override async signTransactions(transactions: Transaction[]) {
        await this.validateSession()
        const results = await this.bridge.request<
            Array<{
                message: SolanaWeb3.MessageArgs | SolanaWeb3.MessageV0Args
                signatures: Uint8Array[]
            }>
        >({
            method: 'signAllTransactions',
            params: {
                message: transactions.map((transaction) => {
                    return encode(serializeTransaction(transaction))
                }),
            },
        })

        return results.map((transaction, index) => {
            return recoverTransaction(transactions[index], transaction.message, transaction.signatures)
        })
    }
}
