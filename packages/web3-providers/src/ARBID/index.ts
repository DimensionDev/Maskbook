import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import { SID_DomainAPI } from '../SID/index.js'
import type { NameServiceAPI } from '../entry-types.js'

export class ARBID_API implements NameServiceAPI.Provider {
    private SID_Domain = new SID_DomainAPI()

    get id() {
        return NameServiceID.ARBID
    }

    async lookup(name: string) {
        return attemptUntil(
            [this.SID_Domain].map((x) => () => x.lookup(ChainId.Arbitrum, name)),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [this.SID_Domain].map((x) => () => x.reverse(ChainId.Arbitrum, address)),
            undefined,
        )
    }
}
