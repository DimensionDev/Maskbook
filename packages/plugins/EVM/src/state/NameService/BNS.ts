import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

// TODO: implement
export class BNS_Resolver implements NameServiceResolver<ChainId> {
    public get id() {
        return NameServiceID.BSC
    }

    async lookup(name: string) {
        return ''
    }

    async reverse(address: string) {
        return ''
    }
}
