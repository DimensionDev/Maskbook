import type { TransactionContext } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings'
import type { TransactionDescriptor } from '../types'
import { getTokenAmountDescription } from '../utils'

export class BaseTransactionDescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId, string | undefined>) {
        const connection = await Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await connection?.getFungibleToken(NATIVE_TOKEN_ADDRESS!)

        return {
            chainId: context.chainId,
            title: context.methods?.find((x) => x.name)?.name ?? 'Contract Interaction',
            description: context.value
                ? getTokenAmountDescription(context.value as string | undefined, nativeToken, true)
                : '-',
        }
    }
}
