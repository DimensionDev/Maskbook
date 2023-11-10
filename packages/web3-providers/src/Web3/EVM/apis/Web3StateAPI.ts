import { lazyObject } from '@masknet/shared-base'
import type { Web3State } from '@masknet/web3-shared-evm'
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

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await Provider.EVMProvider.new(context)

    const state: Web3State = lazyObject({
        Settings: () => new Settings.EVMSettings(context),
        Provider: () => Provider_,
        BalanceNotifier: () => new BalanceNotifier.EVMBalanceNotifier(),
        BlockNumberNotifier: () => new BlockNumberNotifier.EVMBlockNumberNotifier(),
        Network: () => new Network.EVMNetwork(context),
        AddressBook: () => new AddressBook.EVMAddressBook(context),
        IdentityService: () => new IdentityService.EVMIdentityService(context),
        NameService: () => new NameService.EVMNameService(context),
        RiskWarning: () =>
            new RiskWarning.EVMRiskWarning(context, {
                account: Provider_.account,
            }),
        Message: () => new Message.EVMMessage(context),
        Token: () =>
            new Token.EVMToken(context, {
                account: Provider_.account,
                chainId: Provider_.chainId,
            }),
        Transaction: () =>
            new Transaction.EVMTransaction(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
        TransactionFormatter: () => new TransactionFormatter.EVMTransactionFormatter(),
        TransactionWatcher: () =>
            new TransactionWatcher.EVMTransactionWatcher(context, {
                chainId: Provider_.chainId!,
                transactions: state.Transaction!.transactions!,
            }),
    })
    return state
}
