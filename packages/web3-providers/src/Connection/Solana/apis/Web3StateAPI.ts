import type { Plugin } from '@masknet/plugin-infra'
import { ValueRefWithReady, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { Web3State } from '@masknet/web3-shared-solana'
import { AddressBook } from '../state/AddressBook.js'
import { Hub } from '../state/Hub.js'
import { Provider } from '../state/Provider.js'
import { Connection } from '../state/Connection.js'
import { Settings } from '../state/Settings.js'
import { Transaction } from '../state/Transaction.js'
import { Others } from '../state/Others.js'
import { IdentityService } from '../state/IdentityService.js'
import { Storage } from '../state/Storage/index.js'
import { Web3StateAPI_Base } from '../../Base/apis/Web3StateAPI.js'

export const SolanaWeb3StateRef = new ValueRefWithReady<
    Web3Helper.Definition[NetworkPluginID.PLUGIN_SOLANA]['Web3State']
>()

export class SolanaWeb3StateAPI extends Web3StateAPI_Base<NetworkPluginID.PLUGIN_SOLANA> {
    constructor() {
        super(SolanaWeb3StateRef)
    }

    override async create(context: Plugin.Shared.SharedUIContext): Promise<Web3State> {
        const Provider_ = new Provider(context)
        await Provider_.setup()

        return {
            AddressBook: new AddressBook(context, {
                chainId: Provider_.chainId,
            }),
            Hub: new Hub(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
            IdentityService: new IdentityService(context),
            Settings: new Settings(context),
            Transaction: new Transaction(context, {
                chainId: Provider_.chainId,
                account: Provider_.account,
            }),
            Provider: Provider_,
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
