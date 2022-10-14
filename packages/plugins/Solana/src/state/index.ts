import type { Plugin } from '@masknet/plugin-infra'
import { Provider } from './Provider.js'
import { AddressBook } from './AddressBook.js'
import { Hub } from './Hub.js'
import { Connection } from './Connection.js'
import { Settings } from './Settings.js'
import { Transaction } from './Transaction.js'
import { Wallet } from './Wallet.js'
import { Others } from './Others.js'
import type { SolanaWeb3State } from './Connection/types.js'
import { IdentityService } from './IdentityService.js'
import { NameService } from './NameService.js'
import { Storage } from './Storage/index.js'

export function createWeb3State(context: Plugin.Shared.SharedUIContext): SolanaWeb3State {
    const Provider_ = new Provider(context)
    const Settings_ = new Settings(context)

    return {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Hub: new Hub(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            currencyType: Settings_.currencyType,
        }),
        IdentityService: new IdentityService(context),
        NameService: new NameService(context),
        Settings: Settings_,
        Transaction: new Transaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        Provider: Provider_,
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
