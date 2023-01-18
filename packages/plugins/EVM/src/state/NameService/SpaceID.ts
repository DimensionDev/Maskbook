import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainbaseDomain } from '@masknet/web3-providers'

export class SpaceID_Resolver implements NameServiceResolver {
    public get id() {
        return NameServiceID.SpaceID
    }

    async lookup(name: string) {
        return ChainbaseDomain.lookup(ChainId.BSC, name.toLowerCase())
    }

    async reverse(address: string) {
        return ChainbaseDomain.reverse(ChainId.BSC, address)
    }
}
