import { ENS } from '@masknet/web3-providers'
import { NameServiceID } from '@masknet/shared-base'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class ENS_Resolver implements NameServiceResolver {
    public get id() {
        return NameServiceID.ENS
    }

    async lookup(name: string) {
        return ENS.lookup(ChainId.Mainnet, name)
    }

    async reverse(address: string) {
        return ENS.reverse(ChainId.Mainnet, address)
    }
}
