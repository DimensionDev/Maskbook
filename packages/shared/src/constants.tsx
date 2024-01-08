import type { ReactNode } from 'react'
import { Icons, type GeneratedIcon } from '@masknet/icons'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<EnhanceableSite | string, ReactNode> = {
    [EnhanceableSite.Twitter]: <Icons.TwitterX />,
    [EnhanceableSite.Facebook]: <Icons.FacebookColored />,
    [EnhanceableSite.Minds]: <Icons.Minds />,
    [EnhanceableSite.Instagram]: <Icons.InstagramColored />,
    [EnhanceableSite.OpenSea]: <Icons.OpenSeaColored />,
    [EnhanceableSite.Mirror]: <Icons.Mirror />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<EnhanceableSite | string, GeneratedIcon | null> = {
    [EnhanceableSite.Twitter]: Icons.TwitterXRound,
    [EnhanceableSite.Facebook]: Icons.FacebookRound,
    [EnhanceableSite.Minds]: Icons.MindsRound,
    [EnhanceableSite.Instagram]: Icons.InstagramRoundColored,
    [EnhanceableSite.OpenSea]: Icons.OpenSeaColored,
    [EnhanceableSite.Mirror]: Icons.Mirror,
    [EnhanceableSite.Localhost]: null,
}

export enum RSS3_NFT_SITE_KEY {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export const EnhanceableSite_RSS3_NFT_SITE_KEY_map: Partial<Record<EnhanceableSite, RSS3_NFT_SITE_KEY>> = {
    [EnhanceableSite.Facebook]: RSS3_NFT_SITE_KEY.FACEBOOK,
    [EnhanceableSite.Twitter]: RSS3_NFT_SITE_KEY.TWITTER,
    [EnhanceableSite.Instagram]: RSS3_NFT_SITE_KEY.INSTAGRAM,
}

export const PERSONA_AVATAR_DB_NAMESPACE = 'com.maskbook.persona.avatar.storage'

export enum PopupHomeTabType {
    SocialAccounts = 'Social Accounts',
    ConnectedWallets = 'Connected Wallets',
}

export const TRADER_WEB3_CONFIG = {
    [NetworkPluginID.PLUGIN_EVM]: {
        supportedChainIds: [
            ChainId.Mainnet,
            ChainId.BSC,
            ChainId.Matic,
            ChainId.Arbitrum,
            ChainId.xDai,
            ChainId.Aurora,
            ChainId.Avalanche,
            ChainId.Fantom,
            ChainId.Astar,
            ChainId.Optimism,
        ],
    },
    [NetworkPluginID.PLUGIN_FLOW]: { supportedChainIds: [] },
    [NetworkPluginID.PLUGIN_SOLANA]: { supportedChainIds: [] },
}
