import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { createHub } from '../../EVM/apis/HubAPI.js'
import { createSolanaHub } from '../../Solana/apis/HubAPI.js'
import { unreachable } from '@masknet/kit'
import type { Hub } from '../types/index.js'

export function getHub<T extends NetworkPluginID>(
    pluginID: T,
    initial?: BaseHubOptions<Web3Helper.Definition[T]['ChainId']>,
) {
    type Creator = (initial?: BaseHubOptions<Web3Helper.Definition[T]['ChainId']>) => Hub<T>

    const creator = (
        pluginID === NetworkPluginID.PLUGIN_EVM ? createHub
        : pluginID === NetworkPluginID.PLUGIN_SOLANA ? createSolanaHub
        : unreachable(pluginID)) as Creator

    return creator(initial)
}
