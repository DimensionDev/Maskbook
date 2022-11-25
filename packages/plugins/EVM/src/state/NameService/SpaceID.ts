import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { SpaceID } from '@masknet/web3-providers'

export class SpaceID_Resolver implements NameServiceResolver {
    public get id() {
        return NameServiceID.SpaceID
    }

    async lookup(name: string) {
        return SpaceID.lookup(ChainId.BSC, name)
    }

    async reverse(address: string) {
        return SpaceID.reverse(ChainId.BSC, address)
    }
}
