import { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import { getReceiptStatus } from '../../Connection/utils'

export class ReceiptChecker implements TransactionChecker<ChainId> {
    async checkStatus(id: string, chainId: ChainId): Promise<TransactionStatusType> {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId,
        })
        const receipt = await connection?.getTransactionReceipt(id)
        return getReceiptStatus(receipt ?? null) ?? TransactionStatusType.NOT_DEPEND
    }
}
