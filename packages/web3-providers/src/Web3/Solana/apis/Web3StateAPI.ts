import type { Web3State } from '@masknet/web3-shared-solana'
import { SolanaAddressBook } from '../state/AddressBook.js'
import { SolanaProvider } from '../state/Provider.js'
import { SolanaSettings } from '../state/Settings.js'
import { SolanaTransaction } from '../state/Transaction.js'
import { SolanaIdentityService } from '../state/IdentityService.js'
import { SolanaNetwork } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { solana } from '../../../Manager/registry.js'

export const SolanaWeb3StateRef = {
    get value() {
        return solana.state
    },
}
export async function createSolanaState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await SolanaProvider.new(context)

    return {
        AddressBook: new SolanaAddressBook(context),
        IdentityService: new SolanaIdentityService(context),
        Settings: new SolanaSettings(context),
        Network: new SolanaNetwork(context),
        Transaction: new SolanaTransaction(context, {
            chainId: Provider_.chainId,
            account: Provider_.account,
        }),
        Provider: Provider_,
    }
}
