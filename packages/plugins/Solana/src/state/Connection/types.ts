import type { AccountInfo } from '@solana/web3.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/shared-base'

export interface SolanaWeb3State extends Web3Helper.Web3State<NetworkPluginID.PLUGIN_SOLANA> {}

export interface SolanaConnection extends Web3Helper.Web3Connection<NetworkPluginID.PLUGIN_SOLANA> {
    getAccountInfo(account: string): Promise<AccountInfo<Buffer> | null>
}

export interface SolanaConnectionOptions extends Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_SOLANA> {}
