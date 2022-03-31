import type { ReactNode } from 'react'
import {
    FacebookColoredIcon,
    InstagramColoredIcon,
    MindsIcon,
    TwitterColoredIcon,
    OpenSeaColoredIcon,
} from '@masknet/icons'

export const MINDS_ID = 'minds.com'
export const FACEBOOK_ID = 'facebook.com'
export const TWITTER_ID = 'twitter.com'
export const INSTAGRAM_ID = 'instagram.com'
export const OPENSEA_ID = 'opensea.io'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, ReactNode> = {
    [TWITTER_ID]: <TwitterColoredIcon />,
    [FACEBOOK_ID]: <FacebookColoredIcon />,
    [MINDS_ID]: <MindsIcon />,
    [INSTAGRAM_ID]: <InstagramColoredIcon />,
    [OPENSEA_ID]: <OpenSeaColoredIcon />,
}

export const mediaViewerUrl = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
