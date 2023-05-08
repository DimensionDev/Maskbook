import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { type ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS, SpaceID } from '@masknet/web3-providers'
import type { NameServiceAPI } from '@masknet/web3-providers/types'

export class NameService extends NameServiceState<ChainId> {
    constructor(context: Plugin.Shared.SharedContext) {
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
