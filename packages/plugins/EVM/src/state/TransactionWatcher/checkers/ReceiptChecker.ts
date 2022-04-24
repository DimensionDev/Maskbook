import type { TransactionStatusType, Web3Plugin } from '@masknet/plugin-infra/web3'
import type { ChainId } from '@masknet/web3-shared-evm'

export class ReceiptChecker implements Web3Plugin.TransactionChecker<ChainId> {
    checkStatus(chainId: ChainId, id: string): Promise<TransactionStatusType> {
        throw new Error('Method not implemented.')
    }
}
