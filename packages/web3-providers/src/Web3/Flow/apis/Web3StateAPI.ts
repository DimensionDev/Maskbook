import type { Web3State } from '@masknet/web3-shared-flow'
import { FlowAddressBook } from '../state/AddressBook.js'
import { FlowProvider } from '../state/Provider.js'
import { FlowSettings } from '../state/Settings.js'
import { FlowTransaction } from '../state/Transaction.js'
import { FlowIdentityService } from '../state/IdentityService.js'
import { FlowNetwork } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { flow } from '../../../Manager/registry.js'

export const FlowWeb3StateRef = {
    get value() {
        return flow.state
    },
}
export async function createFlowState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await FlowProvider.new(context)

    return {
        AddressBook: new FlowAddressBook(context),
        IdentityService: new FlowIdentityService(context),
        Settings: new FlowSettings(context),
        Network: new FlowNetwork(context),
        Transaction: new FlowTransaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        Provider: Provider_,
    }
}
