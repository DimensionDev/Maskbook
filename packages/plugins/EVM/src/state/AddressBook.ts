import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import { AddressBookState, Plugin } from '@masknet/plugin-infra'
import { ChainId, formatEthereumAddress, isSameAddress, isValidAddress } from '@masknet/web3-shared-evm'

export class AddressBook extends AddressBookState<ChainId, Record<ChainId, string[]>> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        const defaultValue = getEnumAsArray(ChainId).reduce((accumulator, chainId) => {
            accumulator[chainId.value] = []
            return accumulator
        }, {} as Record<ChainId, string[]>)

        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
