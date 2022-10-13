import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceID } from '@masknet/shared-base'
import { NameServiceState } from '@masknet/web3-state'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS_Resolver } from './NameService/ENS.js'
import { BSC_Resolver } from './NameService/BSC.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            subscriptions.chainId?.getCurrentValue() === ChainId.BSC ? new BSC_Resolver() : new ENS_Resolver(),
            subscriptions.chainId?.getCurrentValue() === ChainId.BSC ? NameServiceID.BSC : NameServiceID.EVM,
            {
                isValidName: (x) => x !== '0x',
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress: formatEthereumAddress,
            },
        )
    }
}
