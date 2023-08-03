import { ChainId } from '@masknet/web3-shared-evm'
import { NameServiceID } from '@masknet/shared-base'
import { attemptUntil } from '@masknet/web3-shared-base'
import { SID_DomainAPI } from '../SID/index.js'
import type { NameServiceAPI } from '../entry-types.js'

const SID_Domain = new SID_DomainAPI()

export class ARBID_API implements NameServiceAPI.Provider {
    get id() {
        return NameServiceID.ARBID
    }

    async lookup(name: string) {
        return attemptUntil(
            [SID_Domain].map((x) => () => x.lookup(ChainId.Arbitrum, name)),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [SID_Domain].map((x) => () => x.reverse(ChainId.Arbitrum, address)),
            undefined,
        )
    }
}
