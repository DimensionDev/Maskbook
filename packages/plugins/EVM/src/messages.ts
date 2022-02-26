import { createPluginMessage, createPluginRPC, PluginMessageEmitter } from '@masknet/plugin-infra'
import { serializer } from '@masknet/shared-base'
import type { NetworkType, ProviderType } from '@masknet/web3-shared-evm'
import type { JsonRpcPayload } from 'web3-core-helpers'
import { PLUGIN_ID } from './constants'

if (import.meta.webpackHot) import.meta.webpackHot.accept()

export type ConnectWalletDialogEvent =
    | {
          open: true
          providerType: ProviderType
          networkType: NetworkType
      }
    | {
          open: false
          result: boolean
      }

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

    /**
     * Connect wallet dialog
     */
    connectWalletDialogUpdated: ConnectWalletDialogEvent

    rpc: unknown
}

const evmEventEmitter: PluginMessageEmitter<EVM_Messages> = createPluginMessage<EVM_Messages>(PLUGIN_ID, serializer)

export const EVM_Messages: { events: PluginMessageEmitter<EVM_Messages> } = {
    events: evmEventEmitter,
}

export const EVM_RPC = createPluginRPC(PLUGIN_ID, () => import('./services'), EVM_Messages.events.rpc)
