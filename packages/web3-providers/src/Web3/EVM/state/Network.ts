import { type ChainId, type NetworkType, type SchemaType } from '@masknet/web3-shared-evm'
import type { ReasonableNetwork, TransferableNetwork } from '@masknet/web3-shared-base'
import { NetworkState } from '../../Base/state/Network.js'
import { createSchema } from '../schemas/ChainDescriptor.js'
import { fetchChainId } from '../../../helpers/fetchChainId.js'

export class EVMNetwork extends NetworkState<ChainId, SchemaType, NetworkType> {
    protected override async validateNetwork(
        network: TransferableNetwork<ChainId, SchemaType, NetworkType>,
    ): Promise<boolean> {
        const schema = createSchema(this.networks?.getCurrentValue() ?? [])
        const result = await schema.safeParseAsync(network)
        return result.success
    }

    protected override async pingNetwork(
        network: ReasonableNetwork<ChainId, SchemaType, NetworkType>,
    ): Promise<boolean> {
        if (!network.isCustomized) return true
        const chainId = await fetchChainId(network.rpcUrl)
        return network.chainId === chainId
    }
}
