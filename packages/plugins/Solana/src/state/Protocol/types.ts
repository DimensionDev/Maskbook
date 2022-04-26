import type { AccountInfo } from '@solana/web3.js'
import type { Web3Helper } from '@masknet/plugin-infra/web3'
import type { ChainId, ProviderType, Transaction, Web3, Web3Provider } from '@masknet/web3-shared-solana'
import type { NetworkPluginID, WalletProvider } from '@masknet/web3-shared-base'

export interface SolanaWeb3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_SOLANA> {}

export interface SolanaWeb3ConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_SOLANA> {}

export interface SolanaProvider extends WalletProvider<ChainId, ProviderType, Web3Provider, Web3> {
    /** Sign message. */
    signMessage(dataToSign: string): Promise<string>
    /** Sign a transaction. */
    signTransaction(transaction: Transaction): Promise<Transaction>
    /** Sign multiple transactions. */
    signTransactions(transactions: Transaction[]): Promise<Transaction[]>
}

export interface SolanaConnection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_SOLANA> {
    getAccountInfo(account: string): Promise<AccountInfo<Buffer> | null>
}
