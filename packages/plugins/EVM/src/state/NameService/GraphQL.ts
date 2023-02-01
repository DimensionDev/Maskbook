import { NameServiceID } from '@masknet/shared-base'
import { GraphQL } from '@masknet/web3-providers'
import type { NameServiceResolver } from '@masknet/web3-shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class GraphQLResolver implements NameServiceResolver {
    get id(): NameServiceID {
        return NameServiceID.ENS
    }
    async lookup(name: string) {
        return GraphQL.lookup(ChainId.Mainnet, name)
    }
    async reverse(address: string) {
        return GraphQL.reverse(ChainId.Mainnet, address)
    }
}
