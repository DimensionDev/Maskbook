import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatEthereumAddress, isValidAddress, isZeroAddress } from '@masknet/web3-shared-evm'
import { ENS_Resolver } from './NameService/ENS.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            new ENS_Resolver(),
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidName: (x) => x !== '0x',
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress: formatEthereumAddress,
            },
        )
    }
}
