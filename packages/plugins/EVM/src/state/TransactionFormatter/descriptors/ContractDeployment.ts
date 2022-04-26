import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { getTokenAmountDescription } from '../utils'
import { Web3StateSettings } from '../../../settings'

export class ContractDepolymentDescriptor {
    async compute(context: TransactionContext<ChainId>) {
        const connection = await Web3StateSettings.value.Protocol?.getConnection?.({
            chainId: context.chainId,
        })

        return {
            chainId: context.chainId,
            title: 'Contract Depolyment',
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
