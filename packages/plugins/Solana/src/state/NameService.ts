import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Subscription } from 'use-subscription'
import { lookup, reverse } from '../apis'

export class NameService extends NameServiceState<ChainId> {
    constructor(
        context?: Plugin.Shared.SharedContext,
        subscriptions?: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context!,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions!,
            {
                isValidName: (x) => isValidDomain(x),
                isValidAddress: (x) => isValidAddress(x) && !isZeroAddress(x),
                formatAddress,
            },
        )
    }

    override lookup = lookup
    override reverse = reverse
}
