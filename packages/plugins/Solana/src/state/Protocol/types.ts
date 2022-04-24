import type { AccountInfo } from '@solana/web3.js'
import type { NetworkPluginID, Web3Helper, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, SolProvider, Transaction, Web3 } from '@masknet/web3-shared-solana'

export type SolanaWeb3 = Web3

export type SolanaWeb3State = Web3Helper.Web3State<NetworkPluginID.PLUGIN_SOLANA>

export type SolanaWeb3UI = Web3Helper.Web3UI<NetworkPluginID.PLUGIN_SOLANA>

export type SolanaConnectionOptions = Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_SOLANA>

export interface SolanaProvider extends Web3Plugin.WalletProvider<ChainId, SolProvider, Web3> {
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
