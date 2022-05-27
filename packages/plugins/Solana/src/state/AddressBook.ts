import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { AddressBookState } from '@masknet/plugin-infra/web3'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, formatAddress, isValidAddress } from '@masknet/web3-shared-solana'

export class AddressBook extends AddressBookState<ChainId, Record<ChainId, string[]>> {
    constructor(
        context: Plugin.Shared.SharedContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        // TODO: 6002
        // eslint-disable-next-line unicorn/no-array-reduce
        const defaultValue = getEnumAsArray(ChainId).reduce<Record<ChainId, string[]>>((accumulator, chainId) => {
            accumulator[chainId.value] = []
            return accumulator
        }, {})

        super(context, defaultValue, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
