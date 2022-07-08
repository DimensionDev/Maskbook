import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ContractDeploymentDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
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
                true,
            )}`,
        }
    }
}
