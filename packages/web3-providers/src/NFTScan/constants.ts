import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'

export const NFTSCAN_URL = 'https://nftscan-proxy.r2d2.to'
export const NFTSCAN_BASE = 'https://www.nftscan.com'
export const NFTSCAN_BASE_SOLANA = 'https://solana.nftscan.com'
export const NFTSCAN_LOGO_BASE = 'https://logo.nftscan.com/logo'

export const NFTSCAN_CHAIN_IDS = [ChainId.Mainnet, ChainId.BSC, ChainId.Polygon, ChainId.Base, ChainId.Optimism]

export const NFTScanSupportedChains: Record<NetworkPluginID, number[]> = {
    [NetworkPluginID.PLUGIN_EVM]: NFTSCAN_CHAIN_IDS,
    [NetworkPluginID.PLUGIN_SOLANA]: [SolanaChainId.Mainnet],
    [NetworkPluginID.PLUGIN_FLOW]: [],
}
