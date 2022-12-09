import type SID from '@siddomains/sidjs'
import { ChainId } from '@masknet/web3-shared-evm'
import { Web3API } from '../EVM/index.js'
import type { DomainAPI } from '../entry-types.js'
import type Web3 from 'web3'

export class SpaceID_API implements DomainAPI.Provider<ChainId> {
    private _web3: Web3 | undefined
    private get web3() {
        return (this._web3 ??= new Web3API().createSDK(ChainId.Mainnet))
    }
    private sid: SID | undefined
    private async SID() {
        if (this.sid) return this.sid
        const { default: SID, getSidAddress } = await import('@siddomains/sidjs')
        return (this.sid ??= new SID({ provider: this.web3.currentProvider, sidAddress: getSidAddress(ChainId.BSC) }))
    }

    async lookup(chainId: ChainId, name: string): Promise<string | undefined> {
        if (!name.endsWith('.bnb')) return
        await this.SID()
        return this.sid?.name(name).getAddress()
    }
    async reverse(chainId: ChainId, address: string): Promise<string | undefined> {
        await this.SID()
        const result = await this.sid?.getName(address)
        return result?.name
    }
}
