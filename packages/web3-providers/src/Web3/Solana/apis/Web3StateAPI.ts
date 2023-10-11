import type { Web3State } from '@masknet/web3-shared-solana'
import { AddressBook } from '../state/AddressBook.js'
import { Provider } from '../state/Provider.js'
import { Settings } from '../state/Settings.js'
import { Transaction } from '../state/Transaction.js'
import { IdentityService } from '../state/IdentityService.js'
import { Network } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { solana } from '../../../Manager/registry.js'

export const SolanaWeb3StateRef = {
    get value() {
        return solana.state
    },
}
export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
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
