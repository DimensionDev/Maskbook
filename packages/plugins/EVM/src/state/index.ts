import type Web3 from 'web3'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3Plugin } from '@masknet/plugin-infra/web3'
import type {
    ChainId,
    EthereumTransactionConfig,
    NetworkType,
    ProviderType,
    RequestOptions,
    SendOverrides,
} from '@masknet/web3-shared-evm'
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
import { defer } from '@dimensiondev/kit'

export type State = Web3Plugin.ObjectCapabilities.Capabilities<
    ChainId,
    ProviderType,
    NetworkType,
    string,
    EthereumTransactionConfig,
    SendOverrides,
    RequestOptions,
    Web3
>

let state: State = null!
let [promise, resolve] = defer<void>()

export async function setupWeb3State(context: Plugin.SNSAdaptor.SNSAdaptorContext) {
    const Provider_ = new Provider(context)

    setWeb3State({
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
    })
    return state
}

export function untilWeb3State() {
    return promise
}

export function getWeb3State() {
    if (!state) throw new Error('Please setup state at first.')
    return state
}

export async function setWeb3State(newState: State) {
    state = newState
    resolve()
}
