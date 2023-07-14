import type { Plugin } from '@masknet/plugin-infra'
import { formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { Bonfida } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'
import { NameServiceState } from '../../Base/state/NameService.js'

export class NameService extends NameServiceState {
    constructor(context: Plugin.Shared.SharedUIContext) {
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
