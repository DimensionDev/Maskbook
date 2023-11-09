import type { Transaction } from '@solana/web3.js'
import { injectedSolflareProvider } from '@masknet/injected-script'
import { PhantomMethodType, ProviderType } from '@masknet/web3-shared-solana'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaSolflareProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Solflare
    protected override bridge = injectedSolflareProvider
    override async signMessage(message: string): Promise<string> {
        const { signature } = (await this.bridge.request({
            method: PhantomMethodType.SIGN_MESSAGE,
            params: [new TextEncoder().encode(message)],
        })) as any
        return signature
    }

    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        const { signature, publicKey } = (await this.bridge.request({
            method: PhantomMethodType.SIGN_TRANSACTION,
            params: [transaction],
        })) as any
        transaction.addSignature(publicKey, signature)
        return transaction
    }
}
