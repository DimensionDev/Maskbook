import { PluginMessageEmitter, createPluginMessage } from '@masknet/plugin-infra'
import type { NonFungibleAsset } from '@masknet/web3-shared-base'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { NFTCardPluginID } from './constants'

interface NFTDialogEvent {
    open: boolean
    asset: NonFungibleAsset<ChainId, SchemaType>
}

export interface NFTCardMessage {
    /**
     * open the nft dialog
     */
    nftDialogUpdated: NFTDialogEvent
}

export const PluginNFTCardMessages: PluginMessageEmitter<NFTCardMessage> = createPluginMessage(NFTCardPluginID)
