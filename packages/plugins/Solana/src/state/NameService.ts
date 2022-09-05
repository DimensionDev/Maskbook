import type { Plugin } from '@masknet/plugin-infra'
import { NameServiceResolver, NameServiceState } from '@masknet/plugin-infra/web3'
import { ChainId, formatAddress, isValidAddress, isValidDomain, isZeroAddress } from '@masknet/web3-shared-solana'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Subscription } from 'use-subscription'
import { lookup, reverse } from '../apis'

export class BonfidaResolver implements NameServiceResolver<ChainId> {
    lookup = lookup
    reverse = reverse
}

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
