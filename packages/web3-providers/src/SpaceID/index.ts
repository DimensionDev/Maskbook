import { ChainId } from '@masknet/web3-shared-evm'
import { Web3API } from '../EVM/index.js'
import type { DomainAPI } from '../entry-types.js'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'

export class SpaceID_API implements DomainAPI.Provider<ChainId> {
    private web3 = new Web3API().createWeb3(ChainId.BSC)
    private sid = new ChainbaseDomainAPI()

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name.endsWith('.bnb')) return
        return this.sid.lookup(chainId, name)
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        return this.sid?.reverse(chainId, address)
    }
}
