import { PluginID } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

export const PLUGIN_ID = PluginID.RSS3
export const PLUGIN_DESCRIPTION =
    'Derived from the best out of RSS, RSS3 is an open protocol designed for all our cyber existence in the era of Web3.'
export const PLUGIN_NAME = 'RSS3'

interface NetworkOption {
    network: RSS3BaseAPI.Network
    name: string
    hidden?: boolean
}

export const NetworkOptions: NetworkOption[] = [
    { network: 'arbitrum', name: 'Arbitrum' },
    { network: 'arweave', name: 'Arweave' },
    { network: 'avax', name: 'Avax' },
    { network: 'base', name: 'Base' },
    { network: 'binance-smart-chain', name: 'BNB Chain' },
    { network: 'crossbell', name: 'Crossbell' },
    { network: 'ethereum', name: 'Ethereum' },
    { network: 'farcaster', name: 'Farcaster', hidden: true },
    { network: 'gnosis', name: 'Gnosis' },
    { network: 'linea', name: 'Linea' },
    { network: 'optimism', name: 'Optimism' },
    { network: 'polygon', name: 'Polygon' },
    { network: 'vsl', name: 'RSS3 VSL' },
]

export const Networks = NetworkOptions.map(({ network }) => network)
