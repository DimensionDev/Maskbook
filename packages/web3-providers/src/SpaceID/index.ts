import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import { SID_DomainAPI } from '../SID/index.js'
import type { NameServiceAPI } from '../entry-types.js'

const ChainbaseDomain = new ChainbaseDomainAPI()
const SID_Domain = new SID_DomainAPI()

export class SpaceID_API implements NameServiceAPI.Provider {
    get id() {
        return NameServiceID.SpaceID
    }

    async lookup(name: string) {
        return attemptUntil(
            [ChainbaseDomain, SID_Domain].map((x) => () => x.lookup(ChainId.BSC, name)),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [ChainbaseDomain, SID_Domain].map((x) => () => x.reverse(ChainId.BSC, address)),
            undefined,
        )
    }
}
