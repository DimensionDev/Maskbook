import { ChainId } from '@masknet/web3-shared-evm'
import { attemptUntil } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import { ChainbaseDomain } from '../Chainbase/index.js'
import { R2D2Domain } from '../R2D2/index.js'
import { TheGraphDomain } from '../TheGraph/index.js'
import type { NameServiceAPI } from '../entry-types.js'

class ENS_API implements NameServiceAPI.Provider {
    readonly id = NameServiceID.ENS

    async lookup(name: string) {
        return attemptUntil(
            [ChainbaseDomain, R2D2Domain, TheGraphDomain].map((x) => () => x.lookup(ChainId.Mainnet, name)),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [ChainbaseDomain, R2D2Domain, TheGraphDomain].map((x) => () => x.reverse(ChainId.Mainnet, address)),
            undefined,
        )
    }
}
export const ENS = new ENS_API()
