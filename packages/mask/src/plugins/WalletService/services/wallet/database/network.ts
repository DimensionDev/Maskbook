import { asyncIteratorToArray } from '@masknet/shared-base'
import { type I18NFunction } from '../../../../../utils/i18n-next-ui.js'
import { createSchema, fetchChains } from '../../../../../utils/network-schema.js'
import { PluginDB } from '../../../database/Plugin.db.js'

interface Network {
    name: string
    chainId: number
    rpc: string
    currencySymbol?: string
    explorer?: string
}

interface AddEthereumChainParameter {
    chainId: string
    blockExplorerUrls?: string[]
    chainName?: string
    iconUrls?: string[]
    nativeCurrency?: {
        name: string
        symbol: string
        decimals: number
    }
    rpcUrls?: string[]
}

export interface NetworkRecord extends AddEthereumChainParameter {
    type: 'network'
    /** chain id as id */
    id: string
    createdAt: number
    updatedAt: number
}

function recordToNetwork(record: NetworkRecord): Network {
    return {
        name: record.chainName!,
        chainId: Number.parseInt(record.chainId, 10),
        rpc: record.rpcUrls![0],
        currencySymbol: record.nativeCurrency?.symbol,
        explorer: record.blockExplorerUrls?.[0],
    }
}

// Use submit Network
async function networkToChainParameter(network: Network): Promise<AddEthereumChainParameter | null> {
    const chains = await fetchChains()
    const match = chains.find((x) => x.chainId === network.chainId)
    if (!match) return null
    return {
        chainId: network.chainId.toString(),
        blockExplorerUrls: network.explorer ? [network.explorer] : [],
        chainName: network.name,
        iconUrls: [],
        nativeCurrency: {
            name: network.currencySymbol || match.nativeCurrency.name,
            symbol: match.nativeCurrency.name,
            decimals: match.nativeCurrency.decimals,
        },
        rpcUrls: [network.rpc],
    }
}

export async function getNetworks() {
    const networks = (await asyncIteratorToArray(PluginDB.iterate('network'))).map((x) => x.value)

    return networks
        .sort((a, z) => {
            if (a.updatedAt > z.updatedAt) return -1
            if (a.updatedAt < z.updatedAt) return 1
            if (a.createdAt > z.createdAt) return -1
            if (a.createdAt < z.createdAt) return 1
            return 0
        })
        .map(recordToNetwork)
}

export async function getNetwork(chainId: number) {
    if (!chainId) return null
    const record = await PluginDB.get('network', chainId.toString())
    return record ? recordToNetwork(record) : null
}

export async function addNetwork(network: Network, patch?: Partial<NetworkRecord>) {
    const now = Date.now()
    const fakeT = ((key: string) => key) as I18NFunction
    // i18n is too large to have in background, therefore we just return the key
    const schema = createSchema(fakeT)
    const parsed: Network = await schema.parseAsync(network)
    const chainParameter = await networkToChainParameter(parsed)
    if (!chainParameter) throw new Error('Failed to create Chain Parameter')

    await PluginDB.add({
        type: 'network',
        ...chainParameter,
        id: chainParameter.chainId,
        createdAt: now,
        updatedAt: now,
        ...patch,
    })
}

export async function updateNetwork(chainId: number, updates: Network) {
    const oldNetwork = await PluginDB.get('network', chainId.toString())
    if (!oldNetwork) throw new Error(`Network ${chainId} doesn't exist`)

    await PluginDB.remove('network', chainId.toString())
    await addNetwork(updates, {
        createdAt: Date.now(),
    })
}

export async function deleteNetwork(chainId: number) {
    await PluginDB.remove('network', chainId.toString())
}
