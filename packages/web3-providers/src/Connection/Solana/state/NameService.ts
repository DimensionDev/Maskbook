import type { Plugin } from '@masknet/plugin-infra'
import { type ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { Bonfida } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'
import { NameServiceState } from '../../Base/state/NameService.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            isValidName: (x) => isValidDomain(x),
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress,
        })
    }

    override createResolvers(chainId: ChainId) {
        return [Bonfida] as NameServiceAPI.Provider[]
    }
}
