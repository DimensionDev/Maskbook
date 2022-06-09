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

export async function lookup(chainId: ChainId, name: string) {
    const { domainKey } = await getKey(name.replace('.sol', ''))
    const registry = await NameRegistryState.retrieve(connection(chainId), domainKey)
    return registry.owner.toBase58()
}

export async function reverse(chainId: ChainId, owner: string) {
    const accountKey = new PublicKey(owner)
    return performReverseLookup(connection(chainId), accountKey)
}
