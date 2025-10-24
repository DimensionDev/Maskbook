import { lazyObject, PersistentStorages, NetworkPluginID, InMemoryStorages, NameServiceID } from '@masknet/shared-base'
import {
    type ChainId,
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    getDefaultChainId,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import defer * as AddressBook from '../state/AddressBook.js'
import defer * as Token from '../state/Token.js'
import defer * as Transaction from '../state/Transaction.js'
import defer * as NameService from '../state/NameService.js'
import defer * as Provider from '../state/Provider.js'
import defer * as Settings from '../state/Settings.js'
import defer * as TransactionFormatter from '../state/TransactionFormatter.js'

import defer * as IdentityService from '../state/IdentityService.js'
import defer * as BalanceNotifier from '../state/BalanceNotifier.js'
import defer * as BlockNumberNotifier from '../state/BlockNumberNotifier.js'
import defer * as Message from '../state/Message.js'
import defer * as Network from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'
import { getEnumAsArray } from '@masknet/kit'
import {
    addressStorage,
    networkStorage,
    tokenStorage,
    settingsStorage,
    providerStorage,
    MaskWalletStorage,
} from '../../Base/storage.js'

// If you use defer loading you will miss the subscription time.
import * as TransactionWatcher from '../state/TransactionWatcher.js'

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: transaction } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Transaction`, {
        value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType>,
    }).storage
    const { value: nameService } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_NameServiceV2`, {
        value: Object.fromEntries(getEnumAsArray(NameServiceID).map((x) => [x.value, {}])) as Record<
            NameServiceID,
            Record<string, string>
        >,
    }).storage
    const { value: riskWarning } = InMemoryStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_RiskWarning`, {
        value: {},
    }).storage
    const { messages } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Message`, {
        messages: {},
    }).storage

    const [address, network, token, settings, provider, { baseHostedStorage }] = await Promise.all([
        addressStorage(NetworkPluginID.PLUGIN_EVM),
        networkStorage(NetworkPluginID.PLUGIN_EVM),
        tokenStorage(NetworkPluginID.PLUGIN_EVM),
        settingsStorage(NetworkPluginID.PLUGIN_EVM),
        providerStorage(NetworkPluginID.PLUGIN_EVM, getDefaultChainId(), getDefaultProviderType()),
        MaskWalletStorage(),

        nameService.initializedPromise,
        transaction.initializedPromise,
        riskWarning.initializedPromise,
        messages.initializedPromise,
    ] as const)

    const state: Web3State = lazyObject({
        Settings: () => new Settings.EVMSettings(settings),
        Provider: () => new Provider.EVMProvider(context, provider, baseHostedStorage),
        BalanceNotifier: () => new BalanceNotifier.EVMBalanceNotifier(),
        BlockNumberNotifier: () => new BlockNumberNotifier.EVMBlockNumberNotifier(),
        Network: () => new Network.EVMNetwork(NetworkPluginID.PLUGIN_EVM, network.networkID, network.networks),
        AddressBook: () => new AddressBook.EVMAddressBook(address),
        IdentityService: () => new IdentityService.EVMIdentityService(),
        NameService: () => new NameService.EVMNameService(nameService),
        Message: () => new Message.EVMMessage(context.MessageContext, messages),
        Token: () => new Token.EVMToken({ account: state.Provider?.account, chainId: state.Provider?.chainId }, token),
        Transaction: () =>
            new Transaction.EVMTransaction(
                { chainId: state.Provider?.chainId, account: state.Provider?.account },
                transaction,
            ),
        TransactionFormatter: () => new TransactionFormatter.EVMTransactionFormatter(),
        TransactionWatcher: () =>
            new TransactionWatcher.EVMTransactionWatcher({
                chainId: state.Provider!.chainId!,
                transactions: state.Transaction!.transactions!,
            }),
    })
    state.TransactionWatcher?.start()
    return state
}
