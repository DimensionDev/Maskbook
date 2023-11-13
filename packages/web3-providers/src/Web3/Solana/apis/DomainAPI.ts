import { first } from 'lodash-es'
import * as SolanaWeb3 from /* webpackDefer: true */ '@solana/web3.js'
import {
    performReverseLookup,
    getHashedName,
    getNameAccountKey,
    NameRegistryState,
    getAllDomains,
} from '@bonfida/spl-name-service'
import { NameServiceID } from '@masknet/shared-base'
import { ChainId, createClient } from '@masknet/web3-shared-solana'
import type { NameServiceAPI } from '../../../entry-types.js'

class SolanaDomainAPI implements NameServiceAPI.Provider {
    private client = createClient(ChainId.Mainnet)

    private SOL_TLD_AUTHORITY = new SolanaWeb3.PublicKey('58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx')

    id = NameServiceID.SOL

    private async getKey(name: string) {
        const hashedName = await getHashedName(name)
        const domainKey = await getNameAccountKey(hashedName, undefined, this.SOL_TLD_AUTHORITY)
        return { domainKey, hashedName }
    }

    async lookup(name: string): Promise<string | undefined> {
        try {
            const { domainKey } = await this.getKey(name.replace('.sol', ''))
            const registry = await NameRegistryState.retrieve(this.client, domainKey)
            const owner = registry.registry.owner.toBase58()
            return owner
        } catch {
            return ''
        }
    }
    async reverse(address: string): Promise<string | undefined> {
        const domainKey = new SolanaWeb3.PublicKey(address)
        const keys = await getAllDomains(this.client, domainKey)
        // resolve the first domain
        const key = first(keys)
        if (!key) return

        const domain = await performReverseLookup(this.client, key)
        return `${domain}.sol`
    }
}
export const SolanaDomain = new SolanaDomainAPI()
