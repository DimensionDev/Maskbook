import type { Web3State } from '@masknet/web3-shared-evm'
import { EVMAddressBook } from '../state/AddressBook.js'
import { EVMRiskWarning } from '../state/RiskWarning.js'
import { EVMToken } from '../state/Token.js'
import { EVMTransaction } from '../state/Transaction.js'
import { EVMNameService } from '../state/NameService.js'
import { EVMProvider } from '../state/Provider.js'
import { EVMSettings } from '../state/Settings.js'
import { EVMTransactionFormatter } from '../state/TransactionFormatter.js'
import { EVMTransactionWatcher } from '../state/TransactionWatcher.js'
import { EVMIdentityService } from '../state/IdentityService.js'
import { EVMBalanceNotifier } from '../state/BalanceNotifier.js'
import { EVMBlockNumberNotifier } from '../state/BlockNumberNotifier.js'
import { EVMMessage } from '../state/Message.js'
import { EVMNetwork } from '../state/Network.js'
import type { WalletAPI } from '../../../entry-types.js'

export async function createEVMState(context: WalletAPI.IOContext): Promise<Web3State> {
    const Provider_ = await EVMProvider.new(context)

    const Transaction_ = new EVMTransaction(context, {
        chainId: Provider_.chainId,
        account: Provider_.account,
    })

    return {
        Settings: new EVMSettings(context),
        Provider: Provider_,
        BalanceNotifier: new EVMBalanceNotifier(),
        BlockNumberNotifier: new EVMBlockNumberNotifier(),
        Network: new EVMNetwork(context),
        AddressBook: new EVMAddressBook(context),
        IdentityService: new EVMIdentityService(context),
        NameService: new EVMNameService(context),
        RiskWarning: new EVMRiskWarning(context, {
            account: Provider_.account,
        }),
        Message: new EVMMessage(context),
        Token: new EVMToken(context, {
            account: Provider_.account,
            chainId: Provider_.chainId,
        }),
        Transaction: Transaction_,
        TransactionFormatter: new EVMTransactionFormatter(),
        TransactionWatcher: new EVMTransactionWatcher(context, {
            chainId: Provider_.chainId!,
            transactions: Transaction_.transactions!,
        }),
    }
}
