import type { TransactionContext } from '@masknet/web3-shared-base'
import { type ChainId, getTokenConstants, type TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { Web3StateRef } from '../../../apis/Web3StateAPI.js'

export class BaseTransactionDescriptor implements TransactionDescriptor {
    async compute(context: TransactionContext<ChainId, TransactionParameter>) {
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const hub = Web3StateRef.value.Hub?.getHub?.({
            chainId: context.chainId,
        })
        const nativeToken = await hub?.getFungibleToken?.(NATIVE_TOKEN_ADDRESS!, { chainId: context.chainId })

        return {
            chainId: context.chainId,
            title: context.methods?.find((x) => x.name)?.name ?? 'Contract Interaction',
            description: getTokenAmountDescription(context.value, nativeToken),
        }
    }
}
