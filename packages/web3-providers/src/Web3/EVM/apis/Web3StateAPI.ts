import { lazyObject, PersistentStorages, NetworkPluginID, InMemoryStorages, NameServiceID } from '@masknet/shared-base'
import {
    type ChainId,
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
    getDefaultChainId,
    getDefaultProviderType,
} from '@masknet/web3-shared-evm'
import * as AddressBook from /* webpackDefer: true */ '../state/AddressBook.js'
import * as RiskWarning from /* webpackDefer: true */ '../state/RiskWarning.js'
import * as Token from /* webpackDefer: true */ '../state/Token.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as NameService from /* webpackDefer: true */ '../state/NameService.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Settings from /* webpackDefer: true */ '../state/Settings.js'
import * as TransactionFormatter from /* webpackDefer: true */ '../state/TransactionFormatter.js'

import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as BalanceNotifier from /* webpackDefer: true */ '../state/BalanceNotifier.js'
import * as BlockNumberNotifier from /* webpackDefer: true */ '../state/BlockNumberNotifier.js'
import * as Message from /* webpackDefer: true */ '../state/Message.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
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

    const [address, network, token, settings, provider, { baseHostedStorage, eip4337Storage }] = await Promise.all([
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
        Provider: () => new Provider.EVMProvider(context, provider, baseHostedStorage, eip4337Storage),
        BalanceNotifier: () => new BalanceNotifier.EVMBalanceNotifier(),
        BlockNumberNotifier: () => new BlockNumberNotifier.EVMBlockNumberNotifier(),
        Network: () => new Network.EVMNetwork(NetworkPluginID.PLUGIN_EVM, network.networkID, network.networks),
        AddressBook: () => new AddressBook.EVMAddressBook(address),
        IdentityService: () => new IdentityService.EVMIdentityService(),
        NameService: () => new NameService.EVMNameService(nameService),
        RiskWarning: () => new RiskWarning.EVMRiskWarning(state.Provider?.account, riskWarning),
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
    // Warming up
    state.TransactionWatcher
    return state
}
