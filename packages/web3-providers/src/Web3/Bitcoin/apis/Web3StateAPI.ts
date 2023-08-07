import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction as Web3Transaction,
    TransactionParameter,
    Web3State,
} from '@masknet/web3-shared-bitcoin'
import { AddressBook } from '../state/AddressBook.js'
import { Provider } from '../state/Provider.js'
import { Settings } from '../state/Settings.js'
import { Transaction } from '../state/Transaction.js'
import { IdentityService } from '../state/IdentityService.js'
import { Network } from '../state/Network.js'
import { BalanceNotifier } from '../state/BalanceNotifier.js'
import { BlockNumberNotifier } from '../state/BlockNumberNotifier.js'
import { Web3StateAPI_Base } from '../../Base/apis/StateAPI.js'

export const BitcoinWeb3StateRef = new ValueRefWithReady<
    Web3Helper.Definition[NetworkPluginID.PLUGIN_BITCOIN]['Web3State']
>()

export class BitcoinWeb3StateAPI extends Web3StateAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Web3Transaction,
    TransactionParameter
> {
    constructor() {
        super(BitcoinWeb3StateRef)
    }

    override async create(context: Plugin.Shared.SharedUIContext): Promise<Web3State> {
        const Provider_ = new Provider(context)
        await Provider_.setup()

        return {
            Provider: Provider_,
            BalanceNotifier: new BalanceNotifier(),
            BlockNumberNotifier: new BlockNumberNotifier(),
            AddressBook: new AddressBook(context),
            IdentityService: new IdentityService(context),
            Settings: new Settings(context),
            Network: new Network(context),
            Transaction: new Transaction(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
        }
    }
}
