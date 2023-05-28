import { NetworkPluginID } from '@masknet/shared-base'
import type { TransactionContext, TransactionDescriptor as TransactionDescriptorBase } from '@masknet/web3-shared-base'
import { getTokenConstants, type ChainId, type Transaction, type TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import { AllHubAPI } from '../../../../Router/apis/AllHubAPI.js'
import { ConnectionReadonlyAPI } from '../../../apis/ConnectionReadonlyAPI.js'

export class BaseDescriptor implements TransactionDescriptor {
    protected Web3 = new ConnectionReadonlyAPI()
    protected Hub = new AllHubAPI().use(NetworkPluginID.PLUGIN_EVM)!

    async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<Omit<TransactionDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined> {
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await this.Hub.getFungibleToken(NATIVE_TOKEN_ADDRESS!, { chainId: context.chainId })

        return {
            chainId: context.chainId,
            title: context.methods?.find((x) => x.name)?.name ?? 'Contract Interaction',
            description: getTokenAmountDescription(context.value, nativeToken),
        }
    }
}
