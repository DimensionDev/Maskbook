import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import { ChainbaseDomain } from '../Chainbase/index.js'
import { SID_Domain } from '../SID/index.js'
import type { NameServiceAPI } from '../entry-types.js'

class SpaceID_API implements NameServiceAPI.Provider {
    readonly id = NameServiceID.SpaceID

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
export const SpaceID = new SpaceID_API()
