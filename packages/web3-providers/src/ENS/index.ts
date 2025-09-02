import { NameServiceID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import type { NameServiceAPI } from '../entry-types.js'
import { FireflyDomain } from '../Firefly/Domain.js'

class ENS_API implements NameServiceAPI.Provider {
    readonly id = NameServiceID.ENS

    async lookup(name: string) {
        return FireflyDomain.lookup(ChainId.Mainnet, name)
    }

    async reverse(address: string) {
        return FireflyDomain.reverse(ChainId.Mainnet, address)
    }
}
export const ENS = new ENS_API()
