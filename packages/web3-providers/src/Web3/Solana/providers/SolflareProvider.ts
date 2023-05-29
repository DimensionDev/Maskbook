import type { Transaction } from '@solana/web3.js'
import { injectedSolflareProvider } from '@masknet/injected-script'
import {
    type ChainId,
    PhantomMethodType,
    ProviderType,
    type Web3,
    type Web3Provider,
} from '@masknet/web3-shared-solana'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class SolflareProvider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.Solflare, injectedSolflareProvider)
    }

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
