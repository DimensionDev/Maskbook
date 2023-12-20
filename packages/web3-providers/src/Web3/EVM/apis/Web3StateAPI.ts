import { lazyObject, PersistentStorages, NetworkPluginID, EMPTY_LIST } from '@masknet/shared-base'
import {
    type ChainId,
    ChainIdList,
    type Web3State,
    type Transaction as TransactionType,
} from '@masknet/web3-shared-evm'
import * as AddressBook from /* webpackDefer: true */ '../state/AddressBook.js'
import * as RiskWarning from /* webpackDefer: true */ '../state/RiskWarning.js'
import * as Token from /* webpackDefer: true */ '../state/Token.js'
import * as Transaction from /* webpackDefer: true */ '../state/Transaction.js'
import * as NameService from /* webpackDefer: true */ '../state/NameService.js'
import * as Provider from /* webpackDefer: true */ '../state/Provider.js'
import * as Settings from /* webpackDefer: true */ '../state/Settings.js'
import * as TransactionFormatter from /* webpackDefer: true */ '../state/TransactionFormatter.js'
import * as TransactionWatcher from /* webpackDefer: true */ '../state/TransactionWatcher.js'
import * as IdentityService from /* webpackDefer: true */ '../state/IdentityService.js'
import * as BalanceNotifier from /* webpackDefer: true */ '../state/BalanceNotifier.js'
import * as BlockNumberNotifier from /* webpackDefer: true */ '../state/BlockNumberNotifier.js'
import * as Message from /* webpackDefer: true */ '../state/Message.js'
import * as Network from /* webpackDefer: true */ '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import type { TransactionStorage } from '../../Base/state/Transaction.js'

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const { value: address } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_AddressBookV2`, {
        value: EMPTY_LIST,
    }).storage
    const { messages } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Message`, {
        messages: {},
    }).storage
    const { storage: network } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Network`, {
        networkID: '1_ETH',
        networks: {},
    })
    const { storage: token } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Token`, {
        fungibleTokenList: {},
        credibleFungibleTokenList: {},
        nonFungibleTokenList: {},
        credibleNonFungibleTokenList: {},
        fungibleTokenBlockedBy: {},
        nonFungibleTokenBlockedBy: {},
        nonFungibleCollectionMap: {},
    })
    const { value: transaction } = PersistentStorages.Web3.createSubScope(`${NetworkPluginID.PLUGIN_EVM}_Transaction`, {
        value: Object.fromEntries(ChainIdList.map((x) => [x, {}])) as TransactionStorage<ChainId, TransactionType>,
    }).storage
    const [Provider_] = await Promise.all([
        Provider.EVMProvider.new(context),
        address.initializedPromise,
        messages.initializedPromise,
        network.networkID.initializedPromise,
        network.networks.initializedPromise,
        token.fungibleTokenList.initializedPromise,
        token.credibleFungibleTokenList.initializedPromise,
        token.nonFungibleTokenList.initializedPromise,
        token.credibleNonFungibleTokenList.initializedPromise,
        token.fungibleTokenBlockedBy.initializedPromise,
        token.nonFungibleTokenBlockedBy.initializedPromise,
        token.nonFungibleCollectionMap.initializedPromise,
        transaction.initializedPromise,
    ] as const)

    const state: Web3State = lazyObject({
        Settings: () => new Settings.EVMSettings(),
        Provider: () => Provider_,
        BalanceNotifier: () => new BalanceNotifier.EVMBalanceNotifier(),
        BlockNumberNotifier: () => new BlockNumberNotifier.EVMBlockNumberNotifier(),
        Network: () => new Network.EVMNetwork(NetworkPluginID.PLUGIN_EVM, network.networkID, network.networks),
        AddressBook: () => new AddressBook.EVMAddressBook(address),
        IdentityService: () => new IdentityService.EVMIdentityService(),
        NameService: () => new NameService.EVMNameService(),
        RiskWarning: () =>
            new RiskWarning.EVMRiskWarning({
                account: Provider_.account,
            }),
        Message: () => new Message.EVMMessage(context, messages),
        Token: () => new Token.EVMToken(context, { account: Provider_.account, chainId: Provider_.chainId }, token),
        Transaction: () =>
            new Transaction.EVMTransaction({ chainId: Provider_.chainId, account: Provider_.account }, transaction),
        TransactionFormatter: () => new TransactionFormatter.EVMTransactionFormatter(),
        TransactionWatcher: () =>
            new TransactionWatcher.EVMTransactionWatcher({
                chainId: Provider_.chainId!,
                transactions: state.Transaction!.transactions!,
            }),
    })
    return state
}
