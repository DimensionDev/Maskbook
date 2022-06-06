import { performReverseLookup } from '@bonfida/spl-name-service'
import type { ChainId } from '@masknet/web3-shared-solana'
import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service'

import { Connection, PublicKey } from '@solana/web3.js'
import { NETWORK_ENDPOINTS, SOL_TLD_AUTHORITY } from '../constants'

const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
    return { domainKey, hashedName }
}

const connection = (chainId: ChainId) => {
    return new Connection(NETWORK_ENDPOINTS[chainId])
}

export async function lookup(name: string, chainId: ChainId) {
    try {
        const { domainKey } = await getKey(name.replace('.sol', ''))
        const registry = await NameRegistryState.retrieve(connection(chainId), domainKey)
        return registry.owner.toBase58()
    } catch (error) {
        console.error(error)
        return undefined
    }
}

export async function reverse(owner: string, chainId: ChainId) {
    const accountKey = new PublicKey(owner)
    return performReverseLookup(connection(chainId), accountKey)
}
