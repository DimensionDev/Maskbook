import { Icons, type GeneratedIcon } from '@masknet/icons'
import { EnhanceableSite, NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'
import { ChainId as SolanaChainId } from '@masknet/web3-shared-solana'
import { ChainId as FlowChainId } from '@masknet/web3-shared-flow'

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<EnhanceableSite | string, GeneratedIcon | null> = {
    [EnhanceableSite.Twitter]: Icons.TwitterXRound,
    [EnhanceableSite.Facebook]: Icons.FacebookRound,
    [EnhanceableSite.Minds]: Icons.MindsRound,
    [EnhanceableSite.Instagram]: Icons.InstagramRoundColored,
    [EnhanceableSite.OpenSea]: Icons.OpenSeaColored,
    [EnhanceableSite.Mirror]: Icons.Mirror,
    [EnhanceableSite.Localhost]: Icons.WebBlack,
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

// https://docs.simplehash.com/reference/chains
// sync `resolveChainId` and `ChainNameMap` in `web3-providers/src/SimpleHash/helpers.ts`
export const SimpleHashSupportedChains: Record<NetworkPluginID, number[]> = {
    [NetworkPluginID.PLUGIN_EVM]: [
        ChainId.Mainnet,
        ChainId.BSC,
        ChainId.Base,
        ChainId.Polygon,
        ChainId.Arbitrum,
        ChainId.Optimism,
        ChainId.Avalanche,
        ChainId.xDai,
        ChainId.Scroll,
        ChainId.Zora,
    ],
    [NetworkPluginID.PLUGIN_SOLANA]: [SolanaChainId.Mainnet],
    [NetworkPluginID.PLUGIN_FLOW]: [FlowChainId.Mainnet],
}
