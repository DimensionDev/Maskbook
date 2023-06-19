import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, isValidAddress, formatAddress, ChainIdList } from '@masknet/web3-shared-flow'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState<ChainId, Record<ChainId, string[]>> {
    constructor(
        protected override context: Plugin.Shared.SharedUIContext,
        protected override subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress,
        })
    }
}
