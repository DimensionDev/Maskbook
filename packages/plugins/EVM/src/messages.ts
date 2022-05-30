import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export interface EVM_Messages {
    rpc: unknown
}

const evmEventEmitter: PluginMessageEmitter<EVM_Messages> = createPluginMessage<EVM_Messages>(PLUGIN_ID, serializer)

export const EVM_Messages: { events: PluginMessageEmitter<EVM_Messages> } = {
    events: evmEventEmitter,
}

export const EVM_RPC = createPluginRPC(PLUGIN_ID, () => import('./services'), EVM_Messages.events.rpc)
