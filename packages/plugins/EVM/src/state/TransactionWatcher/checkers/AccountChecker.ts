import type { TransactionChecker, TransactionStatusType } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export class AccountChecker implements TransactionChecker<ChainId> {
    checkStatus(chainId: ChainId, id: string): Promise<TransactionStatusType> {
        console.log('DEBUG: account checker')
        console.log({
            chainId,
            id,
        })
        throw new Error('Method not implemented.')
    }
}
