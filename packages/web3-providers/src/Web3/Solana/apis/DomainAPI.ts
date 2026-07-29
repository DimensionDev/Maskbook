import { first } from 'lodash-es'
import { getSnsDomainsForAddress } from '@solana-name-service/sns-sdk-kit/address'
import { resolve } from '@solana-name-service/sns-sdk-kit/domain'
import { address as toAddress, createSolanaRpc, mainnet } from '@solana/kit'
import { NameServiceID } from '@masknet/shared-base'
import { ChainId, createClientEndpoint } from '@masknet/web3-shared-solana'
import type { NameServiceAPI } from '../../../entry-types.js'

class SolanaDomainAPI implements NameServiceAPI.Provider {
    private client = createSolanaRpc(mainnet(createClientEndpoint(ChainId.Mainnet)))

    id = NameServiceID.SOL

    async lookup(name: string): Promise<string | undefined> {
        try {
            const domain = name.endsWith('.sol') || name.endsWith('.sns') ? name : `${name}.sns`
            return await resolve({ rpc: this.client, domain })
        } catch {
            return ''
        }
    }
    async reverse(address: string): Promise<string | undefined> {
        const domains = await getSnsDomainsForAddress({ rpc: this.client, address: toAddress(address) })
        // resolve the first domain
        const domain = first(domains)
        if (!domain) return

        return `${domain.domain}.sns`
    }
}
export const SolanaDomain = new SolanaDomainAPI()
