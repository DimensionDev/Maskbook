import type { ReactNode } from 'react'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
} from '@masknet/icons'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, ReactNode> = {
    'twitter.com': <TwitterColoredIcon />,
    'facebook.com': <FacebookColoredIcon />,
    'minds.com': <MindsIcon />,
    'instagram.com': <InstagramColoredIcon />,
    'opensea.io': <OpenSeaColoredIcon />,
}

export const mediaViewerUrl = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
export const MAX_PERSONA_LIMIT = 10
