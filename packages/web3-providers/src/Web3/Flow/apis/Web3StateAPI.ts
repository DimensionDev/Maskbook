import { lazyObject } from '@masknet/shared-base'
import type { Web3State } from '@masknet/web3-shared-flow'
import * as AddressBook from /* webpackDefer: true */ '../state/AddressBook.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Settings from /* webpackDefer: true */ '../state/Settings.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'

export async function createFlowState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await Provider.FlowProvider.new(context)

    const state: Web3State = lazyObject({
        AddressBook: () => new AddressBook.FlowAddressBook(),
        IdentityService: () => new IdentityService.FlowIdentityService(),
        Settings: () => new Settings.FlowSettings(),
        Network: () => new Network.FlowNetwork(),
        Transaction: () =>
            new Transaction.FlowTransaction({
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
        Provider: () => Provider_,
    })
    return state
}
