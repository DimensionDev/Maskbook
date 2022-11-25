import SID, { getSidAddress } from '@siddomains/sidjs'
import { ChainId } from '@masknet/web3-shared-evm'
import type { DomainAPI } from '../index.js'
import { Web3API } from '../EVM/index.js'

export class SpaceID_API implements DomainAPI.Provider<ChainId> {
    private web3 = new Web3API().createSDK(ChainId.BSC)
    private sid = new SID({ provider: this.web3.currentProvider, sidAddress: getSidAddress(ChainId.BSC) })

    lookup = async (chainId: ChainId, name: string): Promise<string | undefined> => {
        if (!name.endsWith('.bnb')) return
        return this.sid?.name(name).getAddress()
    }
    reverse = async (chainId: ChainId, address: string): Promise<string | undefined> => {
        const result = await this.sid?.getName(address)
        return result?.name
    }
}
