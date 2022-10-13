import type { NameServiceResolver } from '@masknet/web3-state'

export class BSC_Resolver implements NameServiceResolver {
    async lookup(name: string) {
        return ''
    }

    async reverse(address: string) {
        return ''
    }
}
