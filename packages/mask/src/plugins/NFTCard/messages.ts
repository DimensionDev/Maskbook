import { createPluginMessage, PluginMessageEmitter } from '@masknet/plugin-infra'
import { PLUGIN_ID } from '@masknet/plugin-wallet'

export { WalletMessages } from '@masknet/plugin-wallet'
export type { SelectNftContractDialogEvent } from '@masknet/plugin-wallet'

export type NFTCardDialogUpdateEvent = {
    open: boolean
    tokenId: string
    address: string
}

export interface NFTCardDialogMessage {
    nftCardDialogUpdated: NFTCardDialogUpdateEvent
}

export const NFTCardMessage: { events: PluginMessageEmitter<NFTCardDialogMessage> } = {
    events: createPluginMessage<NFTCardDialogMessage>(PLUGIN_ID),
}
