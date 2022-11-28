import { ChainbaseDomain } from '@masknet/web3-providers'
import { NameServiceID } from '@masknet/shared-base'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class ChainbaseResolver implements NameServiceResolver {
    get id(): NameServiceID {
        return NameServiceID.ENS
    }

    async lookup(name: string) {
        return ChainbaseDomain.lookup(ChainId.Mainnet, name)
    }

    async reverse(address: string) {
        return ChainbaseDomain.reverse(ChainId.Mainnet, address)
    }
}
