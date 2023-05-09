import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction, getTransactionStatusType } from '@masknet/web3-shared-evm'
import { ConnectionAPI } from '../../../apis/ConnectionAPI.js'

export class ReceiptChecker implements TransactionChecker<ChainId, Transaction> {
    private Web3 = new ConnectionAPI()

    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const receipt = await this.Web3.getTransactionReceipt(id, { chainId })
        return getTransactionStatusType(receipt ?? null)
    }
}
