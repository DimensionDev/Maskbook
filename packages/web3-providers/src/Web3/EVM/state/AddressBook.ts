import type { Subscription } from 'use-subscription'
import type { Plugin } from '@masknet/plugin-infra'
import { isSameAddress } from '@masknet/web3-shared-base'
import { type ChainId, ChainIdList, formatEthereumAddress, isValidAddress } from '@masknet/web3-shared-evm'
import { AddressBookState } from '../../Base/state/AddressBook.js'

export class AddressBook extends AddressBookState<ChainId> {
    constructor(
        context: Plugin.Shared.SharedUIContext,
        subscriptions: {
            chainId?: Subscription<ChainId>
        },
    ) {
        super(context, ChainIdList, subscriptions, {
            isValidAddress,
            isSameAddress,
            formatAddress: formatEthereumAddress,
        })
    }
}
