import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import { type ChainId, type Transaction, getTransactionStatusType } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'

export class ReceiptChecker implements TransactionChecker<ChainId, Transaction> {
    async getStatus(chainId: ChainId, id: string, transaction: Transaction): Promise<TransactionStatusType> {
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const receipt = await connection?.getTransactionReceipt(id)
        return getTransactionStatusType(receipt ?? null)
    }
}
