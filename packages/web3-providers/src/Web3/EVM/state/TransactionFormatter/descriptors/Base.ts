import type { TransactionContext } from '@masknet/web3-shared-base'
import { getTokenConstants, type ChainId, type TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptorFormatResult } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { EVMWeb3Readonly } from '../../../apis/ConnectionReadonlyAPI.js'
import { EVMHub } from '../../../apis/HubAPI.js'

export class BaseDescriptor {
    protected Hub = EVMHub
    protected Web3 = EVMWeb3Readonly

    async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<TransactionDescriptorFormatResult | undefined> {
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await this.Hub.getFungibleToken(NATIVE_TOKEN_ADDRESS!, { chainId: context.chainId })
        const methodName = context.methods?.find((x) => x.name)?.name

        return {
            chainId: context.chainId,
            title: methodName ? { key: '{data}', data: methodName } : 'Contract Interaction',
            description: { key: '{data}', data: getTokenAmountDescription(context.value, nativeToken) },
        }
    }
}
