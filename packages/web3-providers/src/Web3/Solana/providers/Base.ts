import type { Transaction } from '@solana/web3.js'
import { Emitter } from '@servie/events'
import { type Account, type Wallet, EMPTY_LIST, createConstantSubscription } from '@masknet/shared-base'
import { ChainId, type ProviderType, type Web3, type Web3Provider } from '@masknet/web3-shared-solana'
import type { WalletAPI } from '../../../entry-types.js'

export class BaseProvider implements WalletAPI.Provider<ChainId, ProviderType, Web3Provider, Web3> {
    web3: Web3 | null = null

    provider: Web3Provider | null = null

    emitter = new Emitter<WalletAPI.ProviderEvents<ChainId, ProviderType>>()

    get subscription() {
        return {
            account: createConstantSubscription(''),
            chainId: createConstantSubscription(ChainId.Mainnet),
            wallets: createConstantSubscription<Wallet[]>(EMPTY_LIST),
        }
    }

    get connected() {
        return false
    }

    // No need to wait by default
    get ready() {
        return true
    }

    // No need to wait by default
    get readyPromise() {
        return Promise.resolve()
    }

    setup(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    addWallet(wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateWallet(address: string, wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateOrAddWallet(wallet: Wallet): Promise<void> {
        throw new Error('Method not implemented.')
    }
    renameWallet(address: string, name: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    removeWallet(address: string, password?: string | undefined): Promise<void> {
        throw new Error('Method not implemented.')
    }
    updateWallets(wallets: Wallet[]): Promise<void> {
        throw new Error('Method not implemented.')
    }
    removeWallets(wallets: Wallet[]): Promise<void> {
        throw new Error('Method not implemented.')
    }
    resetAllWallets(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    switchAccount(account?: string): Promise<void> {
        throw new Error('Method not implemented.')
    }
    switchChain(chainId?: ChainId): Promise<void> {
        throw new Error('Method not implemented.')
    }
    signMessage(message: string): Promise<string> {
        throw new Error('Method not implemented.')
    }
    verifyMessage(message: string, signature: string): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    signTransaction(transaction: Transaction): Promise<Transaction> {
        throw new Error('Method not implemented.')
    }
    signTransactions(transactions: Transaction[]): Promise<Transaction[]> {
        return Promise.all(transactions.map((x) => this.signTransaction(x)))
    }
    createWeb3(options?: WalletAPI.ProviderOptions<ChainId>): Web3 {
        throw new Error('Method not implemented.')
    }
    createWeb3Provider(options?: WalletAPI.ProviderOptions<ChainId>): Web3Provider {
        throw new Error('Method not implemented.')
    }
    connect(chainId: ChainId): Promise<Account<ChainId>> {
        throw new Error('Method not implemented.')
    }
    disconnect(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
