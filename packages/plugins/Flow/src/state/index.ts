import type { CompositeSignature, MutateOptions, TransactionObject } from '@blocto/fcl'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId, NetworkType, ProviderType } from '@masknet/web3-shared-flow'
import { AddressBook } from './AddressBook'
import { Asset } from './Asset'
import { Provider } from './Provider'
import { Protocol } from './Protocol'
import { Settings } from './Settings'
import { TokenList } from './TokenList'
import { Transaction } from './Transaction'
import { Wallet } from './Wallet'
import { Utils } from './Utils'
import type { FlowWeb3 } from './Protocol/types'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    CompositeSignature[],
    MutateOptions,
    TransactionObject,
    never,
    FlowWeb3
>

let state: State = null!

export async function createWeb3State(context: Plugin.Shared.SharedContext) {
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
        Protocol: new Protocol(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
            providerType: Provider_.providerType,
        }),
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
