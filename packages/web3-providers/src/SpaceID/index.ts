import type { ChainId } from '@masknet/web3-shared-evm'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import type { DomainAPI } from '../entry-types.js'

export class SpaceID_API implements DomainAPI.Provider<ChainId> {
    private sid = new ChainbaseDomainAPI()

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name.endsWith('.bnb')) return
        return this.sid.lookup(chainId, name)
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        return this.sid?.reverse(chainId, address)
    }
}
