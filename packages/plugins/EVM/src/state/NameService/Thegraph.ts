import { NameServiceID } from '@masknet/shared-base'
import { TheGraphDomain } from '@masknet/web3-providers'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class TheGraphResolver implements NameServiceResolver {
    get id(): NameServiceID {
        return NameServiceID.ENS
    }
    async reverse(address: string) {
        return TheGraphDomain.reverse(ChainId.Mainnet, address)
    }
    async lookup(name: string) {
        return TheGraphDomain.lookup(ChainId.Mainnet, name)
    }
}
