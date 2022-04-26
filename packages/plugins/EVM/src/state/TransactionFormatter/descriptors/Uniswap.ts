import type { TransactionContext } from '@masknet/web3-shared-base'
import { ChainId, createNativeToken } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils'

export class UniswapDescriptor {
    compute(context: TransactionContext<ChainId>) {
        return Promise.resolve({
            title: 'Contract Depolyment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                createNativeToken(context.chainId),
                true,
            )}`,
        })
    }
}
