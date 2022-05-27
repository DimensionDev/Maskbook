import type { PublicKey, Transaction } from '@solana/web3.js'
import { injectedSolflareProvider } from '@masknet/injected-script'
import { Coin98MethodType, ProviderType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class SolflareProvider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        super(ProviderType.Solflare, injectedSolflareProvider)
    }

    override async signMessage(dataToSign: string): Promise<string> {
        const { signature } = (await this.bridge.request({
            method: Coin98MethodType.SOL_SIGN,
            params: [new TextEncoder().encode(dataToSign)],
        })) as { signature: string }
        return signature
    }

    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        const { signature, publicKey } = (await this.bridge.request({
            method: Coin98MethodType.SOL_SIGN,
            params: [transaction],
        })) as { signature: Buffer; publicKey: PublicKey }
        transaction.addSignature(publicKey, signature)
        return transaction
    }
}
