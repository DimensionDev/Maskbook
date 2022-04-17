import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { Token } from './Token'
import { TokenList } from './TokenList'
import { Transaction } from './Transaction'
import { NameService } from './NameService'
import { Protocol } from './Protocol'
import { Provider } from './Provider'
import { Wallet } from './Wallet'
import { Utils } from './Utils'
import { Settings } from './Settings'

export function createWeb3State(context: Plugin.Shared.SharedContext) {
    const Provider_ = new Provider(context)

    return {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Asset: new Asset(),
        NameService: new NameService(context, {
            chainId: Provider_.chainId,
        }),
        Settings: new Settings(context),
        Token: new Token(context, {
            account: Provider_.account,
        }),
        TokenList: new TokenList(context, {
            chainId: Provider_.chainId,
        }),
        Transaction: new Transaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        Provider: Provider_,
        Protocol: new Protocol(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
        Wallet: new Wallet(context),
        Utils: new Utils(),
    }
}
