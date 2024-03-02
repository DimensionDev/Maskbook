import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { createConnection } from '../../EVM/apis/ConnectionAPI.js'
import { createFlowConnection } from '../../Flow/apis/ConnectionOptionsAPI.js'
import { createSolanaConnection } from '../../Solana/apis/ConnectionOptionsAPI.js'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptions.js'
import { unreachable } from '@masknet/kit'
import type { EVMConnectionOptions } from '../../EVM/types/index.js'
import type { FlowConnectionOptions } from '../../Flow/types/index.js'
import type { SolanaConnectionOptions } from '../../Solana/types/index.js'

export function getWeb3Connection<const T extends NetworkPluginID>(
    pluginID: T,
    initial?: BaseConnectionOptions<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Transaction']
    >,
) {
    type Creator = ReturnType<typeof createConnectionCreator<T>>

    const creator = (
        pluginID === NetworkPluginID.PLUGIN_EVM ? createConnection
        : pluginID === NetworkPluginID.PLUGIN_FLOW ? createFlowConnection
        : pluginID === NetworkPluginID.PLUGIN_SOLANA ? createSolanaConnection
        : unreachable(pluginID)) as Creator

    return creator(initial)
}
