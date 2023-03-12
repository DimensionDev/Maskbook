import { first } from 'lodash-es'
import type { Transaction } from '@solana/web3.js'
import { injectedCoin98SolanaProvider } from '@masknet/injected-script'
import type { Account } from '@masknet/shared-base'
import { type ChainId, Coin98MethodType, ProviderType, type Web3Provider, type Web3 } from '@masknet/web3-shared-solana'
import { BaseInjectedProvider } from './BaseInjected.js'
import type { WalletAPI } from '../../../entry-types.js'

export class SolanaCoin98Provider
    extends BaseInjectedProvider
    implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3>
{
    constructor() {
        super(ProviderType.Coin98, injectedCoin98SolanaProvider)
    }

    override async signMessage(message: string): Promise<string> {
        const { signature } = (await this.bridge.request({
            method: Coin98MethodType.SOL_SIGN,
            params: [new TextEncoder().encode(message)],
        })) as any
        return signature
    }

    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        const { signature, publicKey } = (await this.bridge.request({
            method: Coin98MethodType.SOL_SIGN,
            params: [transaction],
        })) as any
        transaction.addSignature(publicKey, signature)
        return transaction
    }

    override async connect(chainId: ChainId): Promise<Account<ChainId>> {
        await this.readyPromise

        const accounts = (await this.bridge.request({
            method: Coin98MethodType.SOL_ACCOUNTS,
            params: [],
        })) as any

        return {
            chainId,
            account: first(accounts) ?? '',
        }
    }

    override async disconnect() {
        // do nothing
    }
}
