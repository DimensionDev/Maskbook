import { type TransactionContext } from '@masknet/web3-shared-base'
import { type ChainId } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { BaseDescriptor } from './Base.js'

type ParameterTuple = {
    0: string
    1: string
    2: string
    /** #0 */
    token: string
    /** #1 */
    amount: string
    /** #2 */
    dest: string
}
export class OKXSwapDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context_: TransactionContext<ChainId, string | boolean | undefined>) {
        const context = context_ as unknown as TransactionContext<ChainId, ParameterTuple[]>
        console.log('context', { context })
        if (!context.methods?.length) return

        return {
            chainId: context.chainId,
            tokenInAddress: context.hash,
            tokenInAmount: '1000',
            title: 'Swap',
            description: 'Swap completed successfully.',
            snackbar: {
                successfulDescription: 'Swap completed successfully.',
                failedDescription: 'Failed to swap',
            },
            popup: {
                method: 'Swap',
            },
        }
    }
}
