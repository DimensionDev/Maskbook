import type { Web3State } from '@masknet/web3-shared-evm'
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
import { Message } from '../state/Message.js'
import { Network } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'
import { evm } from '../../../Manager/registry.js'

export const Web3StateRef = {
    get value() {
        return evm.state
    },
}
export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await Provider.new(context)

    const Transaction_ = new Transaction(context, {
        chainId: Provider_.chainId,
        account: Provider_.account,
    })

    return {
        Settings: new Settings(context),
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
        Message: new Message(context),
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
