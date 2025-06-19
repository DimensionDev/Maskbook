import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { SID_Domain } from '../SID/index.js'
import type { NameServiceAPI } from '../entry-types.js'

class SpaceID_API implements NameServiceAPI.Provider {
    readonly id = NameServiceID.SpaceID

    async lookup(name: string) {
        return SID_Domain.lookup(ChainId.BSC, name)
    }

    async reverse(address: string) {
        return SID_Domain.reverse(ChainId.BSC, address)
    }
}
export const SpaceID = new SpaceID_API()
