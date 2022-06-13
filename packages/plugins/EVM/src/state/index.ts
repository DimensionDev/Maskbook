import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook'
import { Hub } from './Hub'
import { RiskWarning } from './RiskWarning'
import { Token } from './Token'
import { Transaction } from './Transaction'
import { NameService } from './NameService'
import { Connection } from './Connection'
import { Provider } from './Provider'
import { Wallet } from './Wallet'
import { Others } from './Others'
import { Settings } from './Settings'
import { TransactionFormatter } from './TransactionFormatter'
import { TransactionWatcher } from './TransactionWatcher'
import type { EVM_Web3State } from './Connection/types'
import { IdentityService } from './IdentityService'
import { BalanceNotifier } from './BalanceNotifier'
import { BlockNumberNotifier } from './BlockNumberNotifier'

export function createWeb3State(context: Plugin.Shared.SharedContext): EVM_Web3State {
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
    }
}

export * from './Connection/types'
