import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@dimensiondev/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { AddressBookState } from '@masknet/plugin-infra/web3'
import { ChainId } from '@masknet/web3-shared-flow'
import { isSameAddress, isValidAddress, formatAddress } from '../helpers'

export class AddressBook extends AddressBookState<ChainId, Record<ChainId, string[]>> {
    constructor(
        protected override context: Plugin.Shared.SharedContext,
        protected override subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(
            context,
            getEnumAsArray(ChainId).map((x) => x.value),
            subscriptions,
            {
                isValidAddress,
                isSameAddress,
                formatAddress,
            },
        )
    }
}
