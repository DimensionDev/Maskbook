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

export const SOCIAL_MEDIA_ROUND_ICON_MAPPING: Record<string, ReactNode> = {
    [TWITTER_ID]: <TwitterRoundIcon />,
    [FACEBOOK_ID]: <FacebookRoundIcon />,
    [MINDS_ID]: <MindsRoundIcon />,
    [INSTAGRAM_ID]: <InstagramRoundIcon />,
    [OPENSEA_ID]: <OpenSeaColoredIcon />,
}

export const SOCIAL_MEDIA_NAME: Record<string, string> = {
    [TWITTER_ID]: 'Twitter',
    [FACEBOOK_ID]: 'Facebook',
    [MINDS_ID]: 'Mind',
    [INSTAGRAM_ID]: 'Instagram',
    [OPENSEA_ID]: 'OpenSea',
}

export const SOCIAL_MEDIA_SUPPORTING_NEXT_DOT_ID = [TWITTER_ID]

export const mediaViewerUrl = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
