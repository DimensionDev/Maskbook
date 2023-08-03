import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction, getTransactionStatusType } from '@masknet/web3-shared-evm'
import { ConnectionReadonlyAPI } from '../../../apis/ConnectionReadonlyAPI.js'

const Web3 = new ConnectionReadonlyAPI()

export class ReceiptChecker implements TransactionChecker<ChainId, Transaction> {
    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const receipt = await Web3.getTransactionReceipt(id, { chainId })
        return getTransactionStatusType(receipt ?? null)
    }
}
