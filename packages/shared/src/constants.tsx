import type { ReactNode } from 'react'
import {
    FacebookColored as FacebookColoredIcon,
    InstagramColored as InstagramColoredIcon,
    Minds as MindsIcon,
    TwitterColored as TwitterColoredIcon,
    OpenSeaColoredIcon,
    FacebookRound as FacebookRoundIcon,
    TwitterRound as TwitterRoundIcon,
    InstagramRound as InstagramRoundIcon,
    MindsRound as MindsRoundIcon,
} from '@masknet/icons'
import { EnhanceableSite } from '@masknet/shared-base'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterColoredIcon size={18} />,
    [EnhanceableSite.Facebook]: <FacebookColoredIcon size={18} />,
    [EnhanceableSite.Minds]: <MindsIcon size={18} />,
    [EnhanceableSite.Instagram]: <InstagramColoredIcon size={18} />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon size={18} />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<string, ReactNode> = {
    [EnhanceableSite.Twitter]: <TwitterRoundIcon />,
    [EnhanceableSite.Facebook]: <FacebookRoundIcon />,
    [EnhanceableSite.Minds]: <MindsRoundIcon />,
    [EnhanceableSite.Instagram]: <InstagramRoundIcon />,
    [EnhanceableSite.OpenSea]: <OpenSeaColoredIcon />,
    [EnhanceableSite.Localhost]: null,
}

export const SOCIAL_MEDIA_NAME: Record<string, string> = {
    [EnhanceableSite.Twitter]: 'Twitter',
    [EnhanceableSite.Facebook]: 'Facebook',
    [EnhanceableSite.Minds]: 'Mind',
    [EnhanceableSite.Instagram]: 'Instagram',
    [EnhanceableSite.OpenSea]: 'OpenSea',
    [EnhanceableSite.Localhost]: 'Localhost',
}

export const SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID = [EnhanceableSite.Twitter]

export const mediaViewerUrl = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
