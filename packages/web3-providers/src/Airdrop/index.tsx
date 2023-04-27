import { type ChainId, getAirdropClaimersConstants } from '@masknet/web3-shared-evm'
import { fetchJSON } from '../entry-helpers.js'

export class AirDropAPI {
    async getClaimers(chainId: ChainId) {
        const { CLAIMERS } = getAirdropClaimersConstants(chainId)

        if (!CLAIMERS) return []

        const data = await fetchJSON<Record<string, string>>(`https://cors-next.r2d2.to/?${CLAIMERS}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })

        return data
    }
}
