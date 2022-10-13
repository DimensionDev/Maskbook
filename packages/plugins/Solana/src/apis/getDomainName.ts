import {
    performReverseLookup,
    getHashedName,
    getNameAccountKey,
    NameRegistryState,
    getAllDomains,
} from '@bonfida/spl-name-service'
import { createClient } from '@masknet/web3-shared-solana'
import { PublicKey } from '@solana/web3.js'

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')

const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
    return { domainKey, hashedName }
}

export async function lookup(name: string) {
    try {
        const { domainKey } = await getKey(name.replace('.sol', ''))
        const registry = await NameRegistryState.retrieve(createClient(), domainKey)
        const owner = registry.registry.owner.toBase58()
        return owner
    } catch {
        return ''
    }
}

export async function reverse(owner: string) {
    const domainKey = new PublicKey(owner)
    const keys = await getAllDomains(createClient(), domainKey)
    // resolve the first domain
    const key = keys[0]
    if (!key) return

    const domain = await performReverseLookup(createClient(), key)
    return `${domain}.sol`
}
