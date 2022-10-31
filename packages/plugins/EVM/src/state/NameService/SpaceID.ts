import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import SID, { getSidAddress } from '@siddomains/sidjs'
import { ChainId } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../settings'

export class SpaceID_Resolver implements NameServiceResolver {
    private sid?: SID

    private async init() {
        if (this.sid) return

        const web3 = await Web3StateSettings.value.Connection?.getWeb3?.({
            chainId: ChainId.BSC,
        })
        this.sid = new SID({ provider: web3?.currentProvider, sidAddress: getSidAddress(ChainId.BSC) })
    }
    public get id() {
        return NameServiceID.SpaceID
    }

    async lookup(name: string) {
        if (!name.endsWith('.bnb')) return

        await this.init()
        return this.sid?.name(name).getAddress()
    }

    async reverse(address: string) {
        await this.init()
        return this.sid?.getName(address)
    }
}
