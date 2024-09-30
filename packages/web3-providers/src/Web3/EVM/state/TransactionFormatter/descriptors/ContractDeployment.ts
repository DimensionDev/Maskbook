import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { BaseDescriptor } from './Base.js'
import { getTokenAmountDescription } from '../utils.js'
import type { TransactionDescriptorFormatResult } from '../types.js'

export class ContractDeploymentDescriptor extends BaseDescriptor {
    override async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        return {
            chainId: context.chainId,
            title: 'Contract Deployment',
            description: {
                key: 'Contract Deployment {token}',
                token: getTokenAmountDescription(
                    context.value,
                    await this.Web3.getNativeToken({
                        chainId: context.chainId,
                    }),
                ),
            },
        }
    }
}
