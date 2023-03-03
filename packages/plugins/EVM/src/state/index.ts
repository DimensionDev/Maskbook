import type { Plugin } from '@masknet/plugin-infra'
import { createConstantSubscription } from '@masknet/shared-base'
import { ProviderType } from '@masknet/web3-shared-evm'
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

export async function createWeb3State(
    signal: AbortSignal,
    context: Plugin.Shared.SharedUIContext,
): Promise<EVM_Web3State> {
    const Provider_ = new Provider(context)
    const AddressBook_ = new AddressBook(context, {
        chainId: Provider_.chainId,
    })
    const Settings_ = new Settings(context)
    const Transaction_ = new Transaction(context, {
        chainId: Provider_.chainId,
        account: Provider_.account,
    })
    const TransactionWatcher_ = new TransactionWatcher(context, {
        chainId: Provider_.chainId,
        transactions: Transaction_.transactions,
    })
    const Wallet_ = new Wallet(context, {
        providerType: createConstantSubscription(ProviderType.MaskWallet),
    })

    await Provider_.storage.account.initializedPromise
    await Provider_.storage.providerType.initializedPromise
    await AddressBook_.storage.initializedPromise
    await Settings_.storage.currencyType.initializedPromise
    await Transaction_.storage.initializedPromise
    await TransactionWatcher_.storage.initializedPromise
    await Wallet_.storage.initializedPromise

    await Provider_.setup()
    await Wallet_.setup()

    return {
        Settings: Settings_,
        Provider: Provider_,
        BalanceNotifier: new BalanceNotifier(),
        BlockNumberNotifier: new BlockNumberNotifier(),
        AddressBook: AddressBook_,
        Hub: new Hub(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            currencyType: Settings_.currencyType,
        }),
        IdentityService: new IdentityService(context),
        NameService: new NameService(context),
        RiskWarning: new RiskWarning(context, {
            account: Provider_.account,
        }),
        Token: new Token(context, {
            account: Provider_.account,
            chainId: Provider_.chainId,
        }),
        Transaction: Transaction_,
        TransactionFormatter: new TransactionFormatter(context),
        TransactionWatcher: TransactionWatcher_,
        Connection: new Connection(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
        Wallet: Wallet_,
        Others: new Others(context),
        Storage: new Storage(),
    }
}
