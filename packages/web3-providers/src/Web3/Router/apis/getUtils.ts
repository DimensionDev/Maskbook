import { NetworkPluginID } from '@masknet/shared-base'
import { EVMUtils } from '../../EVM/apis/Utils.js'
import { SolanaUtils } from '../../Solana/apis/Utils.js'
import { unreachable } from '@masknet/kit'
import type { Utils } from '../types/index.js'

export function getUtils<T extends NetworkPluginID>(pluginID: T): Utils<T> {
    if (pluginID === NetworkPluginID.PLUGIN_EVM) return EVMUtils as any
    if (pluginID === NetworkPluginID.PLUGIN_SOLANA) return SolanaUtils as any
    unreachable(pluginID)
}
