import { performReverseLookup } from '@bonfida/spl-name-service'
import { ChainId, createClient } from '@masknet/web3-shared-solana'
import { getHashedName, getNameAccountKey, NameRegistryState } from '@solana/spl-name-service'
import { PublicKey } from '@solana/web3.js'

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')

const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
    return { domainKey, hashedName }
}

export async function lookup(chainId: ChainId, name: string) {
    try {
        const { domainKey } = await getKey(name.replace('.sol', ''))
        const registry = await NameRegistryState.retrieve(createClient(chainId), domainKey)
        return registry.owner.toBase58()
    } catch {
        return ''
    }
}

export async function reverse(chainId: ChainId, owner: string) {
    const accountKey = new PublicKey(owner)
    return performReverseLookup(createClient(chainId), accountKey)
}
