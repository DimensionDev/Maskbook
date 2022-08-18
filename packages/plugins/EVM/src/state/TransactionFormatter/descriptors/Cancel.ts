import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'

export class CancelDescriptor {
    compute(context: TransactionContext<ChainId, TransactionParameter>) {
        return Promise.resolve({
            chainId: context.chainId,
            title: 'Cancel Transaction',
        })
    }
}
