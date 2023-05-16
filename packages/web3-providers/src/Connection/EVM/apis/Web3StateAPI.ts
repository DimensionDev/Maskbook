import { ValueRefWithReady, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Plugin } from '@masknet/plugin-infra'
import type { Web3State } from '@masknet/web3-shared-evm'
import { AddressBook } from '../state/AddressBook.js'
import { Hub } from '../state/Hub.js'
import { RiskWarning } from '../state/RiskWarning.js'
import { Token } from '../state/Token.js'
import { Transaction } from '../state/Transaction.js'
import { NameService } from '../state/NameService.js'
import { Connection } from '../state/Connection.js'
import { Provider } from '../state/Provider.js'
import { Others } from '../state/Others.js'
import { Settings } from '../state/Settings.js'
import { TransactionFormatter } from '../state/TransactionFormatter.js'
import { TransactionWatcher } from '../state/TransactionWatcher.js'
import { IdentityService } from '../state/IdentityService.js'
import { BalanceNotifier } from '../state/BalanceNotifier.js'
import { BlockNumberNotifier } from '../state/BlockNumberNotifier.js'
import { Storage } from '../state/Storage/index.js'
import { Web3StateAPI_Base } from '../../Base/apis/Web3StateAPI.js'

export const Web3StateRef = new ValueRefWithReady<Web3Helper.Definition[NetworkPluginID.PLUGIN_EVM]['Web3State']>()

export class Web3StateAPI extends Web3StateAPI_Base<NetworkPluginID.PLUGIN_EVM> {
    constructor() {
        super(Web3StateRef)
    }

    override async create(context: Plugin.Shared.SharedUIContext): Promise<Web3State> {
        const Provider_ = new Provider(context)
        await Provider_.setup()

        const Settings_ = new Settings(context)

        const Transaction_ = new Transaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        })

        return {
            Settings: Settings_,
            Provider: Provider_,
            BalanceNotifier: new BalanceNotifier(),
            BlockNumberNotifier: new BlockNumberNotifier(),
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
            RiskWarning: new RiskWarning(context, {
                account: Provider_.account,
            }),
            Token: new Token(context, {
                account: Provider_.account,
                chainId: Provider_.chainId,
            }),
            Transaction: Transaction_,
            TransactionFormatter: new TransactionFormatter(context),
            TransactionWatcher: new TransactionWatcher(context, {
                chainId: Provider_.chainId,
                transactions: Transaction_.transactions,
            }),
            Connection: new Connection(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
                providerType: Provider_.providerType,
            }),
            Others: new Others(context),
            Storage: new Storage(),
        }
    }
}
