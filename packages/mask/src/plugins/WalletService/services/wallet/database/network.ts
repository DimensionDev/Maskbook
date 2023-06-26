import { asyncIteratorToArray } from '@masknet/shared-base'
import { omit } from 'lodash-es'
import { PluginDB } from '../../../database/Plugin.db.js'

interface Network {
    name: string
    chainId: number
    rpc: string
    currencySymbol?: string
    explorer?: string
}

export interface NetworkRecord extends Network {
    type: 'network'
    /** chain id as id */
    id: number
    createdAt: number
    updatedAt: number
}

function recordToNetwork(record: NetworkRecord): Network {
    return omit(record, 'id', 'type', 'createdAt', 'updatedAt')
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
    const record = (await PluginDB.get('network', chainId)) ?? null
    return record ? recordToNetwork(record) : null
}

export async function addNetwork(network: Network) {
    const now = Date.now()
    await PluginDB.add({
        ...network,
        type: 'network',
        id: network.chainId,
        createdAt: now,
        updatedAt: now,
    })
}

export async function updateNetwork(chainId: number, updates: Partial<Network>) {
    const oldNetwork = await PluginDB.get('network', chainId)
    const now = Date.now()
    await PluginDB.remove('network', chainId)
    await PluginDB.add({
        type: 'network',
        id: chainId,
        ...oldNetwork,
        ...updates,
        createdAt: oldNetwork?.createdAt || now,
        updatedAt: now,
    } as NetworkRecord)
}

export async function deleteNetwork(chainId: number) {
    await PluginDB.remove('network', chainId)
}
