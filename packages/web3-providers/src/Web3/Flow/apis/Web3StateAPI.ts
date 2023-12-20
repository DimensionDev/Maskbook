import { lazyObject, PersistentStorages, NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    type ChainId,
} from '@masknet/web3-shared-flow'
import * as AddressBook from /* webpackDefer: true */ '../state/AddressBook.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Settings from /* webpackDefer: true */ '../state/Settings.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'

export async function createFlowState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: address } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_FLOW}_AddressBookV2`, {
        value: EMPTY_LIST,
    }).storage
    const { storage: network } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_FLOW}_Network`, {
        networkID: '1_ETH',
        networks: {},
    })
    const { value: transaction } = PersistentStorages.Web3.createSubScope(
        `${NetworkPluginID.PLUGIN_FLOW}_Transaction`,
        { value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType> },
    ).storage
    const [Provider_] = await Promise.all([
        Provider.FlowProvider.new(context),
        address.initializedPromise,
        network.networkID.initializedPromise,
        network.networks.initializedPromise,
        transaction.initializedPromise,
    ] as const)

    const state: Web3State = lazyObject({
        AddressBook: () => new AddressBook.FlowAddressBook(address),
        IdentityService: () => new IdentityService.FlowIdentityService(),
        Settings: () => new Settings.FlowSettings(),
        Network: () => new Network.FlowNetwork(NetworkPluginID.PLUGIN_FLOW, network.networkID, network.networks),
        Transaction: () =>
            new Transaction.FlowTransaction({ chainId: Provider_.chainId, account: Provider_.account }, transaction),
        Provider: () => Provider_,
    })
    return state
}
