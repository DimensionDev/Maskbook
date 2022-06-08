import { NetworkPluginID } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-solana'
import { PublicKey } from '@solana/web3.js'

export const PLUGIN_META_KEY = NetworkPluginID.PLUGIN_SOLANA
export const PLUGIN_ID = NetworkPluginID.PLUGIN_SOLANA
export const PLUGIN_NAME = 'Solana Chain'
export const PLUGIN_DESCRIPTION = ''

export const NETWORK_ENDPOINTS: Record<ChainId, string> = {
    [ChainId.Mainnet]: 'https://solana-api.projectserum.com',
    [ChainId.Testnet]: 'https://api.testnet.solana.com',
    [ChainId.Devnet]: 'https://api.devnet.solana.com',
}
export const ENDPOINT_KEY = 'mainnet-beta'
export const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
export const SOL_ADDRESS = getTokenConstants(ChainId.Mainnet).SOL_ADDRESS!
