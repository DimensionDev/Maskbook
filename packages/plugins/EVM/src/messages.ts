import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import type { ProviderType } from '@masknet/web3-shared-evm'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

export interface EVM_Messages {
    PROVIDER_RPC_REQUEST: {
        providerType: ProviderType
        payload: JsonRpcPayload
    }
    PROVIDER_RPC_RESPONSE: {
        providerType: ProviderType
        payload: JsonRpcPayload
        result?: unknown
        error: Error | null
    }
    rpc: unknown
}

export const EVM_Messages: { events: PluginMessageEmitter<EVM_Messages> } = {
    events: createPluginMessage<EVM_Messages>(PLUGIN_ID, serializer),
}

export const EVM_RPC = createPluginRPC(PLUGIN_ID, () => import('./services'), EVM_Messages.events.rpc)
