import { z } from 'zod'
import type { Plugin } from '@masknet/plugin-infra'
import { NetworkPluginID } from '@masknet/shared-base'
import type { ChainId, NetworkType, SchemaType } from '@masknet/web3-shared-evm'
import type { TransferableNetwork } from '@masknet/web3-shared-base'
import { NetworkState } from '../../Base/state/Network.js'
import { createSchema } from '../schemas/ChainDescriptor.js'

export class Network extends NetworkState<ChainId, SchemaType, NetworkType> {
    constructor(context: Plugin.Shared.SharedUIContext) {
        super(context, {
            pluginID: NetworkPluginID.PLUGIN_EVM,
        })
    }

    protected override async validateNetwork(
        network: TransferableNetwork<ChainId, SchemaType, NetworkType>,
    ): Promise<boolean> {
        const schema = createSchema(this.networks?.getCurrentValue() ?? [])
        const result = await schema.safeParseAsync(network)
        if (result.success) return true
        // distinguish warnings
        return result.error.errors.some((x) => !(x.code === z.ZodIssueCode.custom && x.path[1] === 'symbol'))
    }

    protected override async pingNetwork(
        network: TransferableNetwork<ChainId, SchemaType, NetworkType>,
    ): Promise<boolean> {
        throw new Error('Ping RPC URL.')
    }
}
