import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type {
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction as Web3Transaction,
    TransactionParameter,
    Web3State,
} from '@masknet/web3-shared-solana'
import { AddressBook } from '../state/AddressBook.js'
import { Provider } from '../state/Provider.js'
import { Settings } from '../state/Settings.js'
import { Transaction } from '../state/Transaction.js'
import { IdentityService } from '../state/IdentityService.js'
import { Network } from '../state/Network.js'
import { Web3StateAPI_Base } from '../../Base/apis/StateAPI.js'

export const SolanaWeb3StateRef = new ValueRefWithReady<
    Web3Helper.Definition[NetworkPluginID.PLUGIN_SOLANA]['Web3State']
>()

export class SolanaWeb3StateAPI extends Web3StateAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Web3Transaction,
    TransactionParameter
> {
    constructor() {
        super(SolanaWeb3StateRef)
    }

    override async create(context: Plugin.Shared.SharedUIContext): Promise<Web3State> {
        const Provider_ = new Provider(context)
        await Provider_.setup()

        return {
            AddressBook: new AddressBook(context),
            IdentityService: new IdentityService(context),
            Settings: new Settings(context),
            Network: new Network(context),
            Transaction: new Transaction(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
            Provider: Provider_,
        }
    }
}
