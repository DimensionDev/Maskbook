import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/web3-state'
import { ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { getEnumAsArray } from '@dimensiondev/kit'
import { BonfidaResolver } from './NameService/Bonfida.js'

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context?: Plugin.Shared.SharedContext,
        subscriptions?: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context!,
            new BonfidaResolver(),
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions!,
            {
                isValidName: (x) => isValidDomain(x),
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress,
            },
        )
    }
}
