import { first } from 'lodash-es'
import defer * as SolanaWeb3 from '@solana/web3.js'
import { resolve } from '@bonfida/spl-name-service/resolve'
import { getAllDomains, performReverseLookup } from '@bonfida/spl-name-service/utils'
import { NameServiceID } from '@masknet/shared-base'
import { ChainId, createClient } from '@masknet/web3-shared-solana'
import type { NameServiceAPI } from '../../../entry-types.js'

const SNS_TLD_PATTERN = /\.(?:sns|sol)$/u

class SolanaDomainAPI implements NameServiceAPI.Provider {
    private client = createClient(ChainId.Mainnet)

    id = NameServiceID.SOL

    async lookup(name: string): Promise<string | undefined> {
        try {
            // Version 0.1.50 predates the `.sns` spelling and treats an untrimmed
            // `name.sns` as a subdomain. Both suffixes refer to the same root account.
            const domain = name.trim().toLowerCase().replace(SNS_TLD_PATTERN, '')
            return (await resolve(this.client, domain)).toBase58()
        } catch {
            return ''
        }
    }
    async reverse(address: string): Promise<string | undefined> {
        const owner = new SolanaWeb3.PublicKey(address)
        const keys = await getAllDomains(this.client, owner)
        const key = first(keys)
        if (!key) return

        const domain = await performReverseLookup(this.client, key)
        return `${domain}.sns`
    }
}
export const SolanaDomain = new SolanaDomainAPI()
