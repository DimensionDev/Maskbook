import { NetworkPluginID } from '@masknet/shared-base'
import type { TransactionContext, TransactionDescriptor as TransactionDescriptorBase } from '@masknet/web3-shared-base'
import { getTokenConstants, type ChainId, type Transaction, type TransactionParameter } from '@masknet/web3-shared-evm'
import type { TransactionDescriptor } from '../types.js'
import { getTokenAmountDescription } from '../utils.js'
import type { ConnectionOptions, HubOptions } from '../../../types/index.js'
import { AllHubAPI } from '../../../../Router/apis/AllHubAPI.js'
import { AllConnectionAPI } from '../../../../Router/apis/AllConnectionAPI.js'

export class BaseDescriptor implements TransactionDescriptor {
    protected AllHub = new AllHubAPI()
    protected AllConnection = new AllConnectionAPI()

    protected useHub(initial?: HubOptions) {
        return this.AllHub.use(NetworkPluginID.PLUGIN_EVM, initial)
    }

    protected useConnection(initial?: ConnectionOptions) {
        return this.AllConnection.use(NetworkPluginID.PLUGIN_EVM, initial)
    }

    async compute(
        context: TransactionContext<ChainId, TransactionParameter>,
    ): Promise<Omit<TransactionDescriptorBase<ChainId, Transaction>, 'type' | '_tx'> | undefined> {
        const { NATIVE_TOKEN_ADDRESS } = getTokenConstants(context.chainId)
        const nativeToken = await this.useHub({
            chainId: context.chainId,
        })?.getFungibleToken?.(NATIVE_TOKEN_ADDRESS!, { chainId: context.chainId })

        return {
            chainId: context.chainId,
            title: context.methods?.find((x) => x.name)?.name ?? 'Contract Interaction',
            description: getTokenAmountDescription(context.value, nativeToken),
        }
    }
}
