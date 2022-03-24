import { getHashedName, getNameAccountKey, NameRegistryState, performReverseLookup } from '@bonfida/spl-name-service'
import type { ChainId } from '@masknet/web3-shared-solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { NETWORK_ENDPOINTS } from '../constants'

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
    return { domainKey, hashedName }
}

const connection = (chainId: ChainId) => {
    return new Connection(NETWORK_ENDPOINTS[chainId])
}

export async function lookup(name: string, chainId: ChainId) {
    const { domainKey } = await getKey(name)
    console.log(domainKey)
    console.log(name)
    const { registry, nftOwner } = await NameRegistryState.retrieve(connection(chainId), domainKey)
    return nftOwner?.toBase58()
}

export async function reverse(name: string, chainId: ChainId) {
    const domainKey = new PublicKey(name)
    return performReverseLookup(connection(chainId), domainKey)
}
