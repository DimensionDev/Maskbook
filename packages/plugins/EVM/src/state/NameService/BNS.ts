import type { NameServiceResolver } from '@masknet/web3-state'
import { NameServiceID } from '@masknet/shared-base'

// TODO: implement
export class BNS_Resolver implements NameServiceResolver {
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
