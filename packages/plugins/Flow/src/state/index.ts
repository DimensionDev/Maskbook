import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook.js'
import { Hub } from './Hub.js'
import { Provider } from './Provider.js'
import { Connection } from './Connection.js'
import { Settings } from './Settings.js'
import { Transaction } from './Transaction.js'
import { Wallet } from './Wallet.js'
import { Others } from './Others.js'
import type { FlowWeb3State } from './Connection/types.js'
import { IdentityService } from './IdentityService.js'
import { Storage } from './Storage/index.js'

export async function createWeb3State(
    signal: AbortSignal,
    context: Plugin.Shared.SharedUIContext,
): Promise<FlowWeb3State> {
    const Provider_ = new Provider(context)

    await Provider_.storage.account.initializedPromise
    await Provider_.storage.providerType.initializedPromise

    return {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Hub: new Hub(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        IdentityService: new IdentityService(context),
        Settings: new Settings(context),
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
        Wallet: new Wallet(context, {
            providerType: Provider_.providerType,
        }),
        Others: new Others(context),
        Storage: new Storage(),
    }
}
