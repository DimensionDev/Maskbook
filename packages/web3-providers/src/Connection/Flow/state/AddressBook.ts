import type { Subscription } from 'use-subscription'
import { getEnumAsArray } from '@masknet/kit'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { ChainId, isValidAddress, formatAddress } from '@masknet/web3-shared-flow'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState<ChainId, Record<ChainId, string[]>> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
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
