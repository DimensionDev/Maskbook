import { ChainId } from '@masknet/web3-shared-evm'
import { attemptUntil } from '@masknet/web3-shared-base'
import { NameServiceID } from '@masknet/shared-base'
import { ChainbaseDomainAPI } from '../Chainbase/index.js'
import { R2D2DomainAPI } from '../R2D2/index.js'
import { TheGraphDomainAPI } from '../TheGraph/index.js'
import type { NameServiceAPI } from '../entry-types.js'

export class ENS_API implements NameServiceAPI.Provider {
    private R2D2Domain = new R2D2DomainAPI()
    private ChainbaseDomain = new ChainbaseDomainAPI()
    private TheGraphDomain = new TheGraphDomainAPI()

    get id() {
        return NameServiceID.ENS
    }

    async lookup(name: string) {
        return attemptUntil(
            [this.ChainbaseDomain, this.R2D2Domain, this.TheGraphDomain].map(
                (x) => () => x.lookup(ChainId.Mainnet, name),
            ),
            undefined,
        )
    }

    async reverse(address: string) {
        return attemptUntil(
            [this.ChainbaseDomain, this.R2D2Domain, this.TheGraphDomain].map(
                (x) => () => x.reverse(ChainId.Mainnet, address),
            ),
            undefined,
        )
    }
}
