import type { DomainAPI } from '../entry-types.js'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import type { ChainId } from '@masknet/web3-shared-evm'

export class ENS_API implements DomainAPI.Provider<ChainId> {
    private chainBaseDomainAPI = new ChainbaseDomainAPI()

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        return this.chainBaseDomainAPI.lookup(chainId, name)
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        return this.chainBaseDomainAPI.reverse(chainId, address)
    }
}
