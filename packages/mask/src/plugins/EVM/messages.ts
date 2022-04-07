import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

export interface EVM_Messages {
    INJECTED_PROVIDER_RPC_REQUEST: {
        payload: JsonRpcPayload
    }
    INJECTED_PROVIDER_RPC_RESPONSE: {
        payload: JsonRpcPayload
        result?: any
        error: Error | null
    }
    FORTMATIC_PROVIDER_RPC_REQUEST: {
        payload: JsonRpcPayload
    }
    FORTMATIC_PROVIDER_RPC_RESPONSE: {
        payload: JsonRpcPayload
        result?: any
        error: Error | null
    }
    rpc: unknown
}

const evmEventEmitter: PluginMessageEmitter<EVM_Messages> = createPluginMessage<EVM_Messages>(PLUGIN_ID, serializer)

export const EVM_Messages: { events: PluginMessageEmitter<EVM_Messages> } = {
    events: evmEventEmitter,
}

export const EVM_RPC = createPluginRPC(PLUGIN_ID, () => import('./services'), EVM_Messages.events.rpc)
