import { PluginMessageEmitter, createPluginMessage } from '@masknet/plugin-infra'
import { NFTCardPluginID } from './constants'

interface NFTDialogEvent {
    open: boolean
    tokenId: string
    address: string
}

export interface NFTCardMessage {
    /**
     * open the nft dialog
     */
    nftDialogUpdated: NFTDialogEvent
}

export const PluginNFTCardMessages: PluginMessageEmitter<NFTCardMessage> = createPluginMessage(NFTCardPluginID)
