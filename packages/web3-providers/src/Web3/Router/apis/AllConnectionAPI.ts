import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { type createConnectionCreator } from '../../Base/apis/ConnectionCreator.js'
import { createConnection } from '../../EVM/apis/ConnectionAPI.js'
import { createFlowConnection } from '../../Flow/apis/ConnectionOptionsAPI.js'
import { createSolanaConnection } from '../../Solana/apis/ConnectionOptionsAPI.js'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptions.js'
import { unreachable } from '@masknet/kit'

export function getWeb3Connection<T extends NetworkPluginID>(
    pluginID: T,
    initial?: BaseConnectionOptions<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Transaction']
    >,
) {
    const creator = (
        pluginID === NetworkPluginID.PLUGIN_EVM
            ? createConnection
            : pluginID === NetworkPluginID.PLUGIN_FLOW
                ? createFlowConnection
                : pluginID === NetworkPluginID.PLUGIN_SOLANA
                    ? createSolanaConnection
                    : unreachable(pluginID)
    ) as ReturnType<typeof createConnectionCreator<T>>
    return creator(initial)
}
