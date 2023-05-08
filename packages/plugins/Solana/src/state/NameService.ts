import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { type ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { Bonfida } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedContext) {
        super(context, {
            isValidName: (x) => isValidDomain(x),
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress,
        })
    }

    override createResolvers() {
        return [Bonfida] as NameServiceAPI.Provider[]
    }
}
