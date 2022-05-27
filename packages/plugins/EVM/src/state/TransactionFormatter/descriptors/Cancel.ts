import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'

export class CancelDescriptor {
    compute(context: TransactionContext<ChainId>) {
        return Promise.resolve({
            chainId: context.chainId,
            title: 'Cancel Transaction',
        })
    }
}
