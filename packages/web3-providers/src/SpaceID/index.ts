import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import type { NameServiceAPI } from '../entry-types.js'

export class SpaceID_API implements NameServiceAPI.Provider {
    private ChainbaseDomain = new ChainbaseDomainAPI()

    get id() {
        return NameServiceID.SpaceID
    }

    async lookup(name: string) {
        return attemptUntil(
            [this.ChainbaseDomain].map((x) => () => x.lookup(ChainId.BSC, name)),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [this.ChainbaseDomain].map((x) => () => x.reverse(ChainId.Mainnet, address)),
            undefined,
        )
    }
}
