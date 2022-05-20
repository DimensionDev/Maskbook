import type { Plugin } from '@masknet/plugin-infra'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { RiskWarning } from './RiskWarning'
import { Token } from './Token'
import { TokenIcon } from './TokenIcon'
import { TokenList } from './TokenList'
import { TokenPrice } from './TokenPrice'
import { Transaction } from './Transaction'
import { NameService } from './NameService'
import { Protocol } from './Protocol'
import { Provider } from './Provider'
import { Wallet } from './Wallet'
import { Others } from './Others'
import { Settings } from './Settings'
import { TransactionFormatter } from './TransactionFormatter'
import { TransactionWatcher } from './TransactionWatcher'
import type { EVM_Web3State } from './Protocol/types'
import { IdentityService } from './IdentityService'
import { GasOptions } from './GasOptions'

export function createWeb3State(context: Plugin.Shared.SharedContext): EVM_Web3State {
    const Provider_ = new Provider(context)

    return {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Asset: new Asset(),
        IdentityService: new IdentityService(context),
        NameService: new NameService(context, {
            chainId: Provider_.chainId,
        }),
        RiskWarning: new RiskWarning(context, {
            account: Provider_.account,
        }),
        Settings: new Settings(context),
        GasOptions: new GasOptions(context),
        Token: new Token(context, {
            account: Provider_.account,
        }),
        TokenIcon: new TokenIcon(context),
        TokenPrice: new TokenPrice(context),
        TokenList: new TokenList(context, {
            chainId: Provider_.chainId,
        }),
        Transaction: new Transaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        TransactionFormatter: new TransactionFormatter(context),
        TransactionWatcher: new TransactionWatcher(context),
        Provider: Provider_,
        Protocol: new Protocol(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
        Wallet: new Wallet(context),
        Others: new Others(context),
    }
}

export * from './Protocol/types'
