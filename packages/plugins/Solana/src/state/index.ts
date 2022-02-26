import type { Plugin, Web3Plugin } from '@masknet/plugin-infra'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-solana'
import { Provider } from './Provider'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { Protocol } from './Protocol'
import { Settings } from './Settings'
import { TokenList } from './TokenList'
import { Transaction } from './Transaction'
import { Wallet } from './Wallet'
import { Utils } from './Utils'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    CompositeSignature[],
    MutateOptions
>

let state: State = null!

export async function setupWeb3State(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const Provider_ = new Provider(context)
    state = {
        AddressBook: new AddressBook(context, {
            chainId: Provider_.chainId,
        }),
        Asset: new Asset(),
        Settings: new Settings(context),
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
