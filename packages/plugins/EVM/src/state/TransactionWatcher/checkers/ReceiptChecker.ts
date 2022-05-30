import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export class ReceiptChecker implements TransactionChecker<ChainId> {
    checkStatus(chainId: ChainId, id: string): Promise<TransactionStatusType> {
        throw new Error('Method not implemented.')
    }
}
