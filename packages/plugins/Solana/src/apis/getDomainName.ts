import { getHashedName, getNameAccountKey, NameRegistryState, performReverseLookup } from '@bonfida/spl-name-service'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'

const SOL_TLD_AUTBORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTBORITY)
    return { domainKey, hashedName }
}

const connection = (url = clusterApiUrl('mainnet-beta')) => {
    return new Connection(url)
}

export async function lookup(name: string) {
    const { domainKey } = await getKey(name)
    const { registry, nftOwner } = await NameRegistryState.retrieve(connection(), domainKey)
    return nftOwner?.toBase58()
}

export async function reverse(name: string) {
    const domainKey = new PublicKey(name)
    return performReverseLookup(connection(), domainKey)
}
