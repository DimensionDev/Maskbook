import type { Plugin } from '@masknet/plugin-infra'
import { type ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS, SpaceID } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'
import { NameServiceState } from '../../Base/state/NameService.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            isValidName: (x) => x !== '0x',
            isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
            formatAddress: formatEthereumAddress,
        })
    }

    override createResolvers() {
        return [ENS, SpaceID] as NameServiceAPI.Provider[]
    }
}
