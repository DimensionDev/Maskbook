import { createPluginMessage, type PluginMessageEmitter } from '@masknet/plugin-infra'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { PLUGIN_ID } from './constants.js'

export type SelectNftContractDialogEvent = {
    open: boolean

    chainId?: ChainId
    balance?: number
    /**
     * The selected detailed nft collection.
     */
    collection?: NonFungibleCollection<ChainId, SchemaType>
}

export interface WalletMessage {
    /**
     * Select nft contract dialog
     */
    selectNftContractDialogUpdated: SelectNftContractDialogEvent

    walletsUpdated: void
    requestsUpdated: {
        hasRequest: boolean
    }
    /** true: Now locked; false: Now unlocked */
    walletLockStatusUpdated: boolean

    rpc: unknown
}

if (import.meta.webpackHot) import.meta.webpackHot.accept()
export const WalletMessages: {
    events: PluginMessageEmitter<WalletMessage>
} = {
    events: createPluginMessage<WalletMessage>(PLUGIN_ID),
}
