import { type GeneratedIcon, Icons } from '@masknet/icons'
import { PluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const PLUGIN_META_KEY = `${PluginID.Gitcoin}:1`
export { PLUGIN_NAME } from './base.js'
export const GITCOIN_API_GRANTS_V1 = 'https://grants-stack-indexer-v2.gitcoin.co/graphql'
const TENANTS = ['ALGORAND', 'BINANCE', 'CELO', 'COSMOS', 'ETH', 'KUSAMA', 'POLKADOT', 'RSK', 'ZIL'] as const
export const SUPPORTED_TENANTS = ['ETH']
export type TenantTypes = (typeof TENANTS)[number]

export const TenantToChainIconMap: Record<TenantTypes, GeneratedIcon> = {
    ALGORAND: Icons.Algorand,
    BINANCE: Icons.BSC,
    CELO: Icons.Celo,
    COSMOS: Icons.Cosmos,
    ETH: Icons.ETH,
    KUSAMA: Icons.Kusama,
    POLKADOT: Icons.PolkaDot,
    RSK: Icons.Rsk,
    ZIL: Icons.Zilliqa,
}

export const TenantToChainMap: Partial<Record<TenantTypes, ChainId[]>> = {
    // TODO We temporarily disable Binance
    // BINANCE: [ChainId.BSC],
    ETH: [ChainId.Mainnet, ChainId.Matic],
}
