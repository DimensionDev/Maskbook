import { NameServiceID } from '@masknet/shared-base'
import { R2D2Domain } from '@masknet/web3-providers'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class R2D2Resolver implements NameServiceResolver {
    get id(): NameServiceID {
        return NameServiceID.ENS
    }
    async lookup(name: string) {
        return R2D2Domain.lookup(ChainId.Mainnet, name)
    }
    async reverse(address: string) {
        return R2D2Domain.reverse(ChainId.Mainnet, address)
    }
}
