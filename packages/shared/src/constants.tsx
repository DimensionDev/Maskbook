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

// When you add a new icon, don't forget to add it in packages/mask/src/extension/popups/SSR-server.tsx
export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, React.ReactNode> = {
    [TWITTER_ID]: <TwitterColoredIcon />,
    [FACEBOOK_ID]: <FacebookColoredIcon />,
    [MINDS_ID]: <MindsIcon />,
    [INSTAGRAM_ID]: <InstagramColoredIcon />,
    [OPENSEA_ID]: <OpenSeaColoredIcon />,
}

export const mediaViewerUrl = 'https://media-viewer.r2d2.to/index.html'

export const MAX_WALLET_LIMIT = 100
