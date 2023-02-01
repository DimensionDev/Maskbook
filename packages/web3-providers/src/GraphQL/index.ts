import type { ChainId } from '@masknet/web3-shared-evm'
import type { DomainAPI } from '../entry-types.js'
import { API_URL } from './constants.js'
import urlcat from 'urlcat'
import { fetchJSON } from '../entry-helpers.js'

export class GraphQL_Domain_API implements DomainAPI.Provider<ChainId> {
    lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        throw new Error('Method not implemented.')
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        const response = await fetchJSON<{ reverseRecord: string; domains: string[] }>(urlcat(API_URL, address))
        return response?.reverseRecord
    }
}
