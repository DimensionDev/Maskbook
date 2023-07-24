import urlcat from 'urlcat'
import { ChainId, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import type { DomainAPI } from '../../entry-types.js'
import { fetchCachedJSON } from '../../entry-helpers.js'

const ROOT_HOST = 'https://api.prd.space.id'

export class SID_DomainAPI implements DomainAPI.Provider<ChainId> {
    private resolveTLD(chainId: ChainId) {
        switch (chainId) {
            case ChainId.BSC:
                return 'bnb'
            case ChainId.Arbitrum:
                return 'arb1'
            default:
                return
        }
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        const tld = this.resolveTLD(chainId)
        if (!tld) return

        const result = await fetchCachedJSON<{ code: number; address: string }>(
            urlcat(ROOT_HOST, '/v1/getAddress', {
                tld,
                domain: name,
            }),
        )

        if (result.code === 0 && isValidAddress(result.address)) return result.address
        return
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        const tld = this.resolveTLD(chainId)
        if (!tld) return

        const result = await fetchCachedJSON<{ code: number; name: string }>(
            urlcat(ROOT_HOST, '/v1/getName', {
                tld,
                address,
            }),
        )

        if (result.code === 0 && isValidDomain(result.name)) return result.name
        return
    }
}
