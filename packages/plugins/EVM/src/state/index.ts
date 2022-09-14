import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook.js'
import { Hub } from './Hub.js'
import { RiskWarning } from './RiskWarning.js'
import { Token } from './Token.js'
import { Transaction } from './Transaction.js'
import { NameService } from './NameService.js'
import { Connection } from './Connection.js'
import { Provider } from './Provider.js'
import { Wallet } from './Wallet.js'
import { Others } from './Others.js'
import { Settings } from './Settings.js'
import { TransactionFormatter } from './TransactionFormatter.js'
import { TransactionWatcher } from './TransactionWatcher.js'
import type { EVM_Web3State } from './Connection/types.js'
import { IdentityService } from './IdentityService.js'
import { BalanceNotifier } from './BalanceNotifier.js'
import { BlockNumberNotifier } from './BlockNumberNotifier.js'
import { Storage } from './Storage/index.js'

export function createWeb3State(context: Plugin.Shared.SharedUIContext): EVM_Web3State {
    const Provider_ = new Provider(context)
    const Settings_ = new Settings(context)
    const Transaction_ = new Transaction(context, {
        chainId: Provider_.chainId,
        account: Provider_.account,
    })

    return {
        Settings: Settings_,
        Provider: Provider_,
        BalanceNotifier: new BalanceNotifier(),
        BlockNumberNotifier: new BlockNumberNotifier(),
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Hub: new Hub(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            currencyType: Settings_.currencyType,
        }),
        IdentityService: new IdentityService(context),
        NameService: new NameService(context, {
            chainId: Provider_.chainId,
        }),
        RiskWarning: new RiskWarning(context, {
            account: Provider_.account,
        }),
        Token: new Token(context, {
            account: Provider_.account,
        }),
        Transaction: Transaction_,
        TransactionFormatter: new TransactionFormatter(context),
        TransactionWatcher: new TransactionWatcher(context, {
            chainId: Provider_.chainId,
            transactions: Transaction_.transactions,
        }),
        Connection: new Connection(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
        Wallet: new Wallet(context),
        Others: new Others(context),
        Storage: new Storage(),
    }
}

export * from './Connection/types.js'
