import { lazyObject, PersistentStorages, NetworkPluginID } from '@masknet/shared-base'
import {
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    type ChainId,
    getDefaultChainId,
    getDefaultProviderType,
} from '@masknet/web3-shared-flow'
import defer * as AddressBook from '../state/AddressBook.js'
import defer * as Provider from '../state/Provider.js'
import defer * as Settings from '../state/Settings.js'
import defer * as Transaction from '../state/Transaction.js'
import defer * as IdentityService from '../state/IdentityService.js'
import defer * as Network from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'
import { addressStorage, networkStorage, settingsStorage, providerStorage } from '../../Base/storage.js'
export async function createFlowState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: transaction } = PersistentStorages.Web3.createSubScope(
        `${NetworkPluginID.PLUGIN_FLOW}_Transaction`,
        { value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType> },
    ).storage
    const [address, network, settings, provider] = await Promise.all([
        addressStorage(NetworkPluginID.PLUGIN_FLOW),
        networkStorage(NetworkPluginID.PLUGIN_FLOW),
        settingsStorage(NetworkPluginID.PLUGIN_FLOW),
        providerStorage(NetworkPluginID.PLUGIN_FLOW, getDefaultChainId(), getDefaultProviderType()),

        transaction.initializedPromise,
    ])

    const state: Web3State = lazyObject({
        Provider: () => new Provider.FlowProvider(provider),
        AddressBook: () => new AddressBook.FlowAddressBook(address),
        IdentityService: () => new IdentityService.FlowIdentityService(),
        Settings: () => new Settings.FlowSettings(settings),
        Network: () => new Network.FlowNetwork(NetworkPluginID.PLUGIN_FLOW, network.networkID, network.networks),
        Transaction: () =>
            new Transaction.FlowTransaction(
                { chainId: state.Provider?.chainId, account: state.Provider?.account },
                transaction,
            ),
    })
    return state
}
