import { v4 as uuid } from 'uuid'
import { asyncIteratorToArray } from '@masknet/shared-base'
import { PluginDB } from '../../../database/Plugin.db.js'
import { type I18NFunction } from '../../../../../utils/i18n-next-ui.js'
import { createBaseSchema, createSchema, fetchChains } from '../../../../../utils/network-schema.js'

interface Network {
    /** uuid */
    id: string
    name: string
    chainId: number
    rpc: string
    currencySymbol?: string
    explorer?: string
}

interface AddEthereumChainParameter {
    chainId: string
    chainName?: string
    blockExplorerUrls?: string[]
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
    /** uuid */
    id: string
    createdAt: number
    updatedAt: number
}

function recordToNetwork(record: NetworkRecord): Network {
    return {
        id: record.id,
        name: record.chainName!,
        chainId: Number.parseInt(record.chainId, 10),
        rpc: record.rpcUrls![0],
        currencySymbol: record.nativeCurrency?.symbol,
        explorer: record.blockExplorerUrls?.[0],
    }
}

// Use submit Network
async function networkToChainParameter(network: Omit<Network, 'id'>): Promise<AddEthereumChainParameter | null> {
    const chains = await fetchChains()
    const match = chains.find((x) => x.chainId === +network.chainId)
    if (!match) return null
    return {
        chainId: network.chainId.toString(),
        blockExplorerUrls: network.explorer ? [network.explorer] : [],
        chainName: network.name,
        iconUrls: [],
        nativeCurrency: {
            name: match.nativeCurrency.name || network.currencySymbol || match.nativeCurrency.symbol,
            symbol: network.currencySymbol || match.nativeCurrency.symbol,
            decimals: match.nativeCurrency.decimals,
        },
        rpcUrls: [network.rpc],
    }
}

export async function getNetworks() {
    const networks = (await asyncIteratorToArray(PluginDB.iterate('network'))).map((x) => x.value)

    return networks
        .sort((a, z) => {
            if (a.createdAt > z.createdAt) return -1
            if (a.createdAt < z.createdAt) return 1
            return 0
        })
        .map(recordToNetwork)
}

export async function getNetwork(id: string) {
    const record = await PluginDB.get('network', id)
    return record ? recordToNetwork(record) : null
}

export async function addNetwork(network: Omit<Network, 'id'>, patch?: Partial<NetworkRecord>) {
    // i18n is too large to have in background, therefore we just return the key
    const fakeT = ((key: string) => key) as I18NFunction
    const baseSchema = createBaseSchema(fakeT, () => true)
    const schema = createSchema(fakeT, async (name) => {
        const networks = await getNetworks()
        return !networks.find((network) => network.name === name && network.id !== patch?.id)
    })
    const check = await schema.safeParseAsync(network)
    // currency symbol error is tolerable,
    if (!check.success && check.error.errors.some((issue) => issue.path[0] !== 'currencySymbol')) {
        throw check.error
    }
    // Transform data with zod
    const parsed = baseSchema.parse(network)
    const chainParameter = await networkToChainParameter(parsed)
    if (!chainParameter) throw new Error('Failed to create Chain Parameter')

    const now = Date.now()
    await PluginDB.add({
        type: 'network',
        ...chainParameter,
        id: uuid(),
        createdAt: now,
        updatedAt: now,
        ...patch,
    })
}

export async function updateNetwork(id: string, updates: Network) {
    const oldNetwork = await PluginDB.get('network', id)
    if (!oldNetwork) throw new Error("Network doesn't exist")

    await PluginDB.remove('network', id)
    await addNetwork(updates, {
        id,
        createdAt: oldNetwork.createdAt,
    })
}

export async function deleteNetwork(id: string) {
    await PluginDB.remove('network', id)
}
