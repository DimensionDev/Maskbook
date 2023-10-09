import { PublicKey } from '@solana/web3.js'
import {
    performReverseLookup,
    getHashedName,
    getNameAccountKey,
    NameRegistryState,
    getAllDomains,
} from '@bonfida/spl-name-service'
import { ChainId, createClient } from '@masknet/web3-shared-solana'
import { NameServiceID } from '@masknet/shared-base'
import type { NameServiceAPI } from '../entry-types.js'

const SOL_TLD_AUTHORITY = new PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')
const client = createClient(ChainId.Mainnet)

const getKey = async (name: string) => {
    const hashedName = await getHashedName(name)
    const domainKey = await getNameAccountKey(hashedName, undefined, SOL_TLD_AUTHORITY)
    return { domainKey, hashedName }
}

export async function lookup(name: string) {
    try {
        const { domainKey } = await getKey(name.replace('.sol', ''))
        const registry = await NameRegistryState.retrieve(client, domainKey)
        const owner = registry.registry.owner.toBase58()
        return owner
    } catch {
        return ''
    }
}

export async function reverse(owner: string) {
    const domainKey = new PublicKey(owner)
    const keys = await getAllDomains(client, domainKey)
    // resolve the first domain
    const key = keys[0]
    if (!key) return

    const domain = await performReverseLookup(client, key)
    return `${domain}.sol`
}

class BonfidaAPI implements NameServiceAPI.Provider {
    readonly id = NameServiceID.Bonfida
    lookup = lookup
    reverse = reverse
}
export const Bonfida = new BonfidaAPI()
