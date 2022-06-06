import type { Plugin } from '@masknet/plugin-infra'
import { Provider } from './Provider'
import { AddressBook } from './AddressBook'
import { Hub } from './Hub'
import { Connection } from './Connection'
import { Settings } from './Settings'
import { Transaction } from './Transaction'
import { Wallet } from './Wallet'
import { Others } from './Others'
import type { SolanaWeb3State } from './Connection/types'
import { IdentityService } from './IdentityService'

export function createWeb3State(context: Plugin.Shared.SharedContext): SolanaWeb3State {
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
        Settings: Settings_,
        IdentityService: new IdentityService(context),
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
    }
}
