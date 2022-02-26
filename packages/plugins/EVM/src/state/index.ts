import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId, EthereumTransactionConfig, NetworkType, ProviderType } from '@masknet/web3-shared-evm'
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

export type State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    EthereumTransactionConfig
>

let state: State = null!

export async function setupWeb3State(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const Provider_ = new Provider(context)
    state = {
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
        Protocol: new Protocol(context),
        Wallet: new Wallet(context),
        Utils: new Utils(),
    }
    return state
}

export function getWeb3State() {
    if (!state) throw new Error('Please setup state at first.')
    return state
}

export async function setWeb3State(newState: State) {
    state = newState
}
