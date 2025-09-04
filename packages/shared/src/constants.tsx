import { Icons, type GeneratedIcon } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<string, GeneratedIcon> = {
    [EnhanceableSite.Twitter]: Icons.TwitterXRound,
    [EnhanceableSite.Facebook]: Icons.FacebookRound,
    [EnhanceableSite.Minds]: Icons.MindsRound,
    [EnhanceableSite.Instagram]: Icons.InstagramRoundColored,
    [EnhanceableSite.OpenSea]: Icons.OpenSeaColored,
    [EnhanceableSite.Mirror]: Icons.Mirror,
    [EnhanceableSite.Localhost]: Icons.WebBlack,
    [EnhanceableSite.Farcaster]: Icons.Farcaster,
    [EnhanceableSite.Firefly]: Icons.Firefly,
    [EnhanceableSite.Lens]: Icons.Lens,
} satisfies Record<EnhanceableSite, GeneratedIcon>

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
