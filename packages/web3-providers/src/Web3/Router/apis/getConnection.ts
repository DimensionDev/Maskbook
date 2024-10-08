import { unreachable } from '@masknet/kit'
import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { createConnection } from '../../EVM/apis/ConnectionAPI.js'
import { createSolanaConnection } from '../../Solana/apis/ConnectionOptionsAPI.js'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptions.js'
import type { Connection } from '../types/index.js'

export function getConnection<const T extends NetworkPluginID>(
    pluginID: T,
    initial?: BaseConnectionOptions<
        Web3Helper.Definition[T]['ChainId'],
        Web3Helper.Definition[T]['ProviderType'],
        Web3Helper.Definition[T]['Transaction']
    >,
) {
    type Creator = (
        initial?: BaseConnectionOptions<
            Web3Helper.Definition[T]['ChainId'],
            Web3Helper.Definition[T]['ProviderType'],
            Web3Helper.Definition[T]['Transaction']
        >,
    ) => Connection<T>

    const creator = (
        pluginID === NetworkPluginID.PLUGIN_EVM ? createConnection
        : pluginID === NetworkPluginID.PLUGIN_SOLANA ? createSolanaConnection
        : unreachable(pluginID)) as Creator

    return creator(initial)
}
