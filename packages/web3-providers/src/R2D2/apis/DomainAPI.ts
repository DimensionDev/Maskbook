import urlcat from 'urlcat'
import type { ChainId } from '@masknet/web3-shared-evm'
import { API_URL } from '../constants.js'
import type { DomainAPI } from '../../entry-types.js'
import { fetchJSON } from '../../entry-helpers.js'

export class R2D2DomainAPI implements DomainAPI.Provider<ChainId> {
    lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        throw new Error('Method not implemented.')
    }

    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        const response = await fetchJSON<{ reverseRecord: string; domains: string[] }>(urlcat(API_URL, address))
        return response?.reverseRecord
    }
}
