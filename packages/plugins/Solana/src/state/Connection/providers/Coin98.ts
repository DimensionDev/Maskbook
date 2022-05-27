import { first } from 'lodash-unified'
import type { PublicKey, Transaction } from '@solana/web3.js'
import { injectedCoin98SolanaProvider } from '@masknet/injected-script'
import type { Account } from '@masknet/web3-shared-base'
import { ChainId, Coin98MethodType, ProviderType } from '@masknet/web3-shared-solana'
import type { SolanaProvider } from '../types'
import { BaseInjectedProvider } from './BaseInjected'

export class Coin98Provider extends BaseInjectedProvider implements SolanaProvider {
    constructor() {
        super(ProviderType.Coin98, injectedCoin98SolanaProvider)
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

    override async connect(chainId: ChainId): Promise<Account<ChainId>> {
        await this.readyPromise

        const accounts = (await this.bridge.request({
            method: Coin98MethodType.SOL_ACCOUNTS,
            params: [],
        })) as string[]

        return {
            chainId,
            account: first(accounts) ?? '',
        }
    }

    override async disconnect() {
        // do nothing
    }
}
