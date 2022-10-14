import type { NameServiceResolver } from '@masknet/web3-state'

// TODO: implement
export class BNS_Resolver implements NameServiceResolver {
    async lookup(name: string) {
        return ''
    }

    async reverse(address: string) {
        return ''
    }
}
