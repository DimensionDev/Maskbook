import { NameServiceID } from '@masknet/shared-base'
import { Thegraph } from '@masknet/web3-providers'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class ThegraphResolver implements NameServiceResolver {
    get id(): NameServiceID {
        return NameServiceID.ENS
    }
    async reverse(address: string) {
        return Thegraph.reverse(ChainId.Mainnet, address)
    }
    async lookup(name: string) {
        return Thegraph.lookup(ChainId.Mainnet, name)
    }
}
