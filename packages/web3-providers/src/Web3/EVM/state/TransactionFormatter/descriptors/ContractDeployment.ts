import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptor } from '../types.js'

export class ContractDeploymentDescriptor extends BaseDescriptor implements TransactionDescriptor {
    override async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        return {
            chainId: context.chainId,
            title: 'Contract Deployment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                await this.Web3.getNativeToken({
                    chainId: context.chainId,
                }),
            )}`,
        }
    }
}
