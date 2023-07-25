import type { ReactNode } from 'react'
import { Icons, type GeneratedIcon } from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<EnhanceableSite | string, ReactNode> = {
    [EnhanceableSite.Twitter]: <Icons.TwitterColored />,
    [EnhanceableSite.Facebook]: <Icons.FacebookColored />,
    [EnhanceableSite.Minds]: <Icons.Minds />,
    [EnhanceableSite.Instagram]: <Icons.InstagramColored />,
    [EnhanceableSite.OpenSea]: <Icons.OpenSeaColored />,
    [EnhanceableSite.Mirror]: <Icons.Mirror />,
    [EnhanceableSite.Mask]: <Icons.MaskBlue />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<EnhanceableSite | string, GeneratedIcon | null> = {
    [EnhanceableSite.Twitter]: Icons.TwitterRound,
    [EnhanceableSite.Facebook]: Icons.FacebookRound,
    [EnhanceableSite.Minds]: Icons.MindsRound,
    [EnhanceableSite.Instagram]: Icons.InstagramRoundColored,
    [EnhanceableSite.OpenSea]: Icons.OpenSeaColored,
    [EnhanceableSite.Mirror]: Icons.Mirror,
    [EnhanceableSite.Mask]: Icons.MaskBlue,
    [EnhanceableSite.Localhost]: null,
}

export enum RSS3_KEY_SNS {
    TWITTER = '_nfts',
    FACEBOOK = '_facebook_nfts',
    INSTAGRAM = '_instagram_nfts',
}

export const SNS_RSS3_FIELD_KEY_MAP: Partial<Record<EnhanceableSite, RSS3_KEY_SNS>> = {
    [EnhanceableSite.Facebook]: RSS3_KEY_SNS.FACEBOOK,
    [EnhanceableSite.Twitter]: RSS3_KEY_SNS.TWITTER,
    [EnhanceableSite.Instagram]: RSS3_KEY_SNS.INSTAGRAM,
}

export const PERSONA_AVATAR_DB_NAMESPACE = 'com.maskbook.persona.avatar.storage'
