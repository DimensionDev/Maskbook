import type { TransactionContext } from '@masknet/web3-shared-base'
import { type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import { ChainResolverAPI } from '../../../apis/ResolverAPI.js'
import { BaseDescriptor } from './Base.js'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptor } from '../types.js'

export class UniswapDescriptor extends BaseDescriptor implements TransactionDescriptor {
    private ChainResolver = new ChainResolverAPI()

    override compute(context: TransactionContext<ChainId, TransactionParameter>) {
        return Promise.resolve({
            chainId: context.chainId,
            title: 'Contract Deployment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                this.ChainResolver.nativeCurrency(context.chainId),
            )}`,
        })
    }
}
