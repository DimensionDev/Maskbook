import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction, getTransactionStatusType } from '@masknet/web3-shared-evm'
import { EVMWeb3Readonly } from '../../../apis/ConnectionReadonlyAPI.js'

class ReceiptCheckerAPI implements TransactionChecker<ChainId, Transaction> {
    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const receipt = await EVMWeb3Readonly.getTransactionReceipt(id, { chainId })
        return getTransactionStatusType(receipt ?? null)
    }
}
export const EVMReceiptChecker = new ReceiptCheckerAPI()
