import { ValueRefWithReady, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Plugin } from '@masknet/plugin-infra'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Transaction as Web3Transaction,
    TransactionParameter,
    Web3State,
} from '@masknet/web3-shared-evm'
import { Web3StateAPI_Base } from '../../Base/apis/StateAPI.js'
import { AddressBook } from '../state/AddressBook.js'
import { RiskWarning } from '../state/RiskWarning.js'
import { Token } from '../state/Token.js'
import { Transaction } from '../state/Transaction.js'
import { NameService } from '../state/NameService.js'
import { Provider } from '../state/Provider.js'
import { Settings } from '../state/Settings.js'
import { TransactionFormatter } from '../state/TransactionFormatter.js'
import { TransactionWatcher } from '../state/TransactionWatcher.js'
import { IdentityService } from '../state/IdentityService.js'
import { BalanceNotifier } from '../state/BalanceNotifier.js'
import { BlockNumberNotifier } from '../state/BlockNumberNotifier.js'
import { Request } from '../state/Request.js'
import { Network } from '../state/Network.js'

export const Web3StateRef = new ValueRefWithReady<Web3Helper.Definition[NetworkPluginID.PLUGIN_EVM]['Web3State']>()

export class Web3StateAPI extends Web3StateAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    RequestArguments,
    RequestOptions,
    Web3Transaction,
    TransactionParameter
> {
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
            Network: new Network(context),
            AddressBook: new AddressBook(context),
            IdentityService: new IdentityService(context),
            NameService: new NameService(context),
            RiskWarning: new RiskWarning(context, {
                account: Provider_.account,
            }),
            Request: new Request(context),
            Token: new Token(context, {
                account: Provider_.account,
                chainId: Provider_.chainId,
            }),
            Transaction: Transaction_,
            TransactionFormatter: new TransactionFormatter(context),
            TransactionWatcher: new TransactionWatcher(context, {
                chainId: Provider_.chainId!,
                transactions: Transaction_.transactions!,
            }),
        }
    }
}
