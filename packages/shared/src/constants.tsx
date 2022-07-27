import type { ReactNode } from 'react'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
    FacebookRoundIcon,
    TwitterRoundIcon,
    InstagramRoundIcon,
    MindsRoundIcon,
} from '@masknet/icons'
import { EnhanceableSite, NextIDPlatform } from '@masknet/shared-base'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<EnhanceableSite | string, ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterColoredIcon />,
    [EnhanceableSite.Facebook]: <FacebookColoredIcon />,
    [EnhanceableSite.Minds]: <MindsIcon />,
    [EnhanceableSite.Instagram]: <InstagramColoredIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<EnhanceableSite | string, ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterRoundIcon />,
    [EnhanceableSite.Facebook]: <FacebookRoundIcon />,
    [EnhanceableSite.Minds]: <MindsRoundIcon />,
    [EnhanceableSite.Instagram]: <InstagramRoundIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_NAME: Record<EnhanceableSite | string, string> = {
    [EnhanceableSite.Twitter]: 'Twitter',
    [EnhanceableSite.Facebook]: 'Facebook',
    [EnhanceableSite.Minds]: 'Mind',
    [EnhanceableSite.Instagram]: 'Instagram',
    [EnhanceableSite.OpenSea]: 'OpenSea',
    [EnhanceableSite.Localhost]: 'Localhost',
}

export const NEXT_ID_PLATFORM_SOCIAL_MEDIA_MAP: Record<string, string> = {
    [NextIDPlatform.Twitter]: EnhanceableSite.Twitter,
}

export const SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID = [EnhanceableSite.Twitter]

export const MEDIA_VIEWER_URL = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
