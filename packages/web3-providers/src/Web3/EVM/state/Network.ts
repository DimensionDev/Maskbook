import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import type { TransferableNetwork } from '@masknet/web3-shared-base'
import { NetworkState } from '../../Base/state/Network.js'
import { ChainDescriptorSchema } from '../schemas/ChainDescriptor.js'

export class Network extends NetworkState<ChainId, SchemaType, NetworkType> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            getNetworkPluginID: () => NetworkPluginID.PLUGIN_EVM,
        })
    }

    private get chainDescriptorSchema() {
        return new ChainDescriptorSchema().schema
    }

    protected override async validateNetwork(
        network: TransferableNetwork<ChainId, SchemaType, NetworkType>,
    ): Promise<boolean> {
        return true
    }
}
