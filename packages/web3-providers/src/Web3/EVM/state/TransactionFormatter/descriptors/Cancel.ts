import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptor } from '../types.js'

export class CancelDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override compute(context: TransactionContext<ChainId, TransactionParameter>) {
        return Promise.resolve({
            chainId: context.chainId,
            title: 'Cancel Transaction',
        })
    }
}
