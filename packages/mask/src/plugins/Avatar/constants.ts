import { PluginId } from '@masknet/plugin-infra'
import { ChainId } from '@masknet/web3-shared-evm'

export const NFT_AVATAR_JSON_SERVER = 'https://configuration.r2d2.to/com.maskbook.avatar.json'
export const NFT_AVATAR_DB_NAME = 'com.maskbook.user'
export const NFT_AVATAR_DB_NAME_STORAGE = 'com.maskbook.user.storage'

export const PLUGIN_ID = PluginId.Avatar
export const PLUGIN_NAME = 'Avatar'
export const PLUGIN_DESCRIPTION = 'NFT Avatar'

export enum RSS3_KEY_SNS {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export enum Application_NFT_LIST_PAGE {
    Application_nft_tab_eth_page = 'ETH',
    Application_nft_tab_polygon_page = 'Polygon',
}

export const SUPPORTED_CHAIN_IDS = [ChainId.Mainnet, ChainId.Matic]
