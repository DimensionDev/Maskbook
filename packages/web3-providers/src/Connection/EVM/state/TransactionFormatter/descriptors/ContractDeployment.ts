import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils.js'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'

export class ContractDeploymentDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const connection = Web3StateRef.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        return {
            chainId: context.chainId,
            title: 'Contract Deployment',
            description: `Contract Deployment ${getTokenAmountDescription(
                context.value,
                await connection?.getNativeToken({
                    chainId: context.chainId,
                }),
            )}`,
        }
    }
}
