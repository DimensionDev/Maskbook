import { fetchJSON } from '@masknet/web3-providers/helpers'
import type { DomainAPI } from '@masknet/web3-providers/types'
import type { ChainId } from '@masknet/web3-shared-evm'
import urlcat from 'urlcat'
import type { ResolveDomainResponse } from './types.js'

const UNSTOPPABLE_HOST = 'https://unstoppable-proxy.r2d2.to'

class UnstoppableAPI implements DomainAPI.Provider<ChainId> {
    public async lookup(chainId: ChainId, handle: string): Promise<string | undefined> {
        const url = urlcat(UNSTOPPABLE_HOST, '/resolve/domains/:handle', {
            handle,
        })
        const res = await fetchJSON<ResolveDomainResponse>(url)
        return res.meta.owner
    }
    public reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        throw new Error('Unimplemented yet.')
    }
}

export const Unstoppable = new UnstoppableAPI()
