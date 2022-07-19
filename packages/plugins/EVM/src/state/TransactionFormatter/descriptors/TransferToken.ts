import type { TransactionContext } from '@masknet/web3-shared-base'
import type { ChainId, TransactionParameter } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import { getTokenAmountDescription } from '../utils'

export class TransferTokenDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        return {
            chainId: context.chainId,
            title: 'Transfer',
            description: `Send token -${getTokenAmountDescription(
                context.value,
                await connection?.getNativeToken({
                    chainId: context.chainId,
                }),
            )}`,
        }
    }
}
