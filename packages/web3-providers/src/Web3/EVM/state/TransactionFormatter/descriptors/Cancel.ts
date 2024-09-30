import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import type { TransactionDescriptorFormatResult } from '../types.js'

export class CancelDescriptor extends BaseDescriptor {
    override async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        return {
            chainId: context.chainId,
            title: 'Cancel Transaction',
        }
    }
}
