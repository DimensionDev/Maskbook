import type { TransactionContext } from '@masknet/web3-shared-base'
import { ChainId, getTokenConstants, TransactionParameter } from '@masknet/web3-shared-evm'
import { Web3StateSettings } from '../../../settings/index.js'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'

export class BaseTransactionDescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const connection = Web3StateSettings.value.Connection?.getConnection?.({
            chainId: context.chainId,
        })

        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await connection?.getFungibleToken(NATIVE_TOKEN_ADDRESS!)

        return {
            chainId: context.chainId,
            title: context.methods?.find((x) => x.name)?.name ?? 'Contract Interaction',
            description: getTokenAmountDescription(context.value, nativeToken),
        }
    }
}
