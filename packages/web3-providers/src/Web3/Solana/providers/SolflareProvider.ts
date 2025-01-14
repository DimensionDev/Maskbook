import { injectedSolflareProvider, type InjectedWalletBridge } from '@masknet/injected-script'
import { ProviderType, type Transaction } from '@masknet/web3-shared-solana'
import { SolanaInjectedWalletProvider } from './BaseInjected.js'

export class SolanaSolflareProvider extends SolanaInjectedWalletProvider {
    protected override providerType = ProviderType.Solflare
    protected override bridge: InjectedWalletBridge = injectedSolflareProvider
    override async signTransaction(transaction: Transaction): Promise<Transaction> {
        throw new Error('method not implemented')
    }

    override async signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        throw new Error('Method not implemented.')
    }

    override signMessage(message: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
