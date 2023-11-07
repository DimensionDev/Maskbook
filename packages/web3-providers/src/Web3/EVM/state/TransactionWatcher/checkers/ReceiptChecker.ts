import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction, getTransactionStatusType } from '@masknet/web3-shared-evm'
import { Web3Readonly } from '../../../apis/ConnectionReadonlyAPI.js'

class ReceiptCheckerAPI implements TransactionChecker<ChainId, Transaction> {
    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const receipt = await Web3Readonly.getTransactionReceipt(id, { chainId })
        return getTransactionStatusType(receipt ?? null)
    }
}
export const ReceiptChecker = new ReceiptCheckerAPI()
