import { NetworkPluginID } from '@masknet/shared-base'
import { OthersAPI } from '../../EVM/apis/OthersAPI.js'
import { FlowOthersAPI } from '../../Flow/apis/OthersAPI.js'
import { SolanaOthersAPI } from '../../Solana/apis/OthersAPI.js'
import { unreachable } from '@masknet/kit'
import type { Others } from '../types/index.js'

export function getOthersAPI<T extends NetworkPluginID>(pluginID: T): Others<T> {
    if (pluginID === NetworkPluginID.PLUGIN_EVM) return OthersAPI as any
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) return SolanaOthersAPI as any
    if (pluginID === NetworkPluginID.PLUGIN_FLOW) return FlowOthersAPI as any
    unreachable(pluginID)
}
