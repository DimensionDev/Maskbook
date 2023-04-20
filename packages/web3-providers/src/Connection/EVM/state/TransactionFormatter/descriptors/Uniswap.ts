import type { TransactionContext } from '@masknet/web3-shared-base'
import { type ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'

export class UniswapDescriptor {
    compute(context: TransactionContext<ChainId>) {
        return Promise.resolve({
            title: 'Contract Deployment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                createNativeToken(context.chainId),
            )}`,
        })
    }
}
