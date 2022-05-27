import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { AddressBookState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'

export class AddressBook extends AddressBookState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = Object.fromEntries(
            getEnumAsArray(ChainId).map((x) => [x.value, []] as [ChainId, string[]]),
        ) as Record<ChainId, string[]>

        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
