import { first } from 'lodash-es'
import { injectedCoin98SolanaProvider, type InjectedWalletBridge } from '@masknet/injected-script'
import type { Account } from '@masknet/shared-base'
import { type ChainId, Coin98MethodType, ProviderType, type Transaction } from '@masknet/web3-shared-solana'

import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaCoin98Provider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Coin98
    protected override bridge: InjectedWalletBridge = injectedCoin98SolanaProvider
    override async signMessage(message: string): Promise<string> {
        const { signature } = (await this.bridge.request({
            method: Coin98MethodType.SOL_SIGN,
            params: [new TextEncoder().encode(message)],
        })) as any
        return signature
    }

    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        throw new Error('Method not implemented.')
    }

    override async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        throw new Error('Method not implemented.')
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
