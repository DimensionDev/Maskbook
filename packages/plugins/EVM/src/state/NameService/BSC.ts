import type { ChainId } from '@masknet/web3-shared-evm'
import type { NameServiceResolver } from '@masknet/web3-state'

export class ENS_Resolver implements NameServiceResolver<ChainId> {
    async lookup(chainId: ChainId, name: string) {
        return ''
    }

    async reverse(chainId: ChainId, address: string) {
        return ''
    }
}
