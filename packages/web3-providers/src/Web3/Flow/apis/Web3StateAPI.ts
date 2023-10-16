import type { Web3State } from '@masknet/web3-shared-flow'
import { AddressBook } from '../state/AddressBook.js'
import { Provider } from '../state/Provider.js'
import { Settings } from '../state/Settings.js'
import { Transaction } from '../state/Transaction.js'
import { IdentityService } from '../state/IdentityService.js'
import { Network } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { flow } from '../../../Manager/registry.js'

export const FlowWeb3StateRef = {
    get value() {
        return flow.state
    },
}
export async function createFlowState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await Provider.new(context)

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
