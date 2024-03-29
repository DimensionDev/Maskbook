import { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'
import { createHub } from '../../EVM/apis/HubAPI.js'
import { createFlowHub } from '../../Flow/apis/HubAPI.js'
import { createSolanaHub } from '../../Solana/apis/HubAPI.js'
import { unreachable } from '@masknet/kit'

export function getHub<T extends NetworkPluginID>(
    pluginID: T,
    initial?: BaseHubOptions<Web3Helper.Definition[T]['ChainId']>,
) {
    if (pluginID === NetworkPluginID.PLUGIN_EVM) return createHub(initial as any)
    if (pluginID === NetworkPluginID.PLUGIN_FLOW) return createFlowHub(initial as any)
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) return createSolanaHub(initial as any)
    unreachable(pluginID)
}
