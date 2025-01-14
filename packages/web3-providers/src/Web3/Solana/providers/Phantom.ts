import { injectedPhantomProvider } from '@masknet/injected-script'
import {
    PhantomMethodType,
    ProviderType,
    serializeTransaction,
    type Transaction,
    type Web3Provider,
} from '@masknet/web3-shared-solana'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import { encode } from 'bs58'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaPhantomProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Phantom
    protected override bridge = injectedPhantomProvider
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

        console.log('DEBUG: transaction', transaction)

        const result = await this.bridge.request<{
            message: SolanaWeb3.MessageArgs | SolanaWeb3.MessageV0Args
            signatures: Uint8Array[]
        }>({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: {
                message: encode(serializeTransaction(transaction)),
            },
        })

        console.log('DEBUG: result', result)

        if ('serializeMessage' in transaction && transaction.feePayer) {
            const args = result.message as SolanaWeb3.MessageArgs
            const transaction = SolanaWeb3.Transaction.populate(
                new SolanaWeb3.Message(args),
                result.signatures.map((x) => encode(x)),
            )
            return transaction
        } else {
            const args = result.message as SolanaWeb3.MessageV0Args
            const msg = new SolanaWeb3.MessageV0({
                ...args,
                staticAccountKeys: args.staticAccountKeys?.map((x) => new SolanaWeb3.PublicKey(x)) || [],
                compiledInstructions: args.compiledInstructions || [],
                addressTableLookups: args.addressTableLookups || [],
            })
            const message = SolanaWeb3.VersionedMessage.deserialize(msg.serialize())
            return new SolanaWeb3.VersionedTransaction(message, result.signatures)
        }
    }

    override async signTransactions(transactions: Transaction[]) {
        await this.validateSession()
        return this.bridge.request<Transaction[]>({
            method: 'signAllTransactions',
            params: {
                message: transactions.map((transaction) => {
                    return encode(serializeTransaction(transaction))
                }),
            },
        })
    }
}
