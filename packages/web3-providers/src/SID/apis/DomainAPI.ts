import urlcat from 'urlcat'
import { ChainId, isValidAddress, isValidDomain } from '@masknet/web3-shared-evm'
import type { DomainAPI } from '../../entry-types.js'
import { fetchCachedJSON } from '../../helpers/fetchJSON.js'
import { resolveCrossOriginURL } from '@masknet/web3-shared-base'

const ROOT_HOST = 'https://api.prd.space.id'

class SID_DomainAPI implements DomainAPI.Provider<ChainId> {
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

        const url = resolveCrossOriginURL(
            urlcat(ROOT_HOST, '/v1/getAddress', {
                tld,
                domain: name,
            }),
        )
        const result = await fetchCachedJSON<{ code: number; address: string }>(url)

        if (result.code === 0 && isValidAddress(result.address)) return result.address
        return
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        const tld = this.resolveTLD(chainId)
        if (!tld) return

        const url = resolveCrossOriginURL(
            urlcat(ROOT_HOST, '/v1/getName', {
                tld,
                address,
            }),
        )
        const result = await fetchCachedJSON<{ code: number; name: string }>(url)

        if (result.code === 0 && isValidDomain(result.name)) return result.name
        return
    }
}

export const SID_Domain = new SID_DomainAPI()
