import type { ReactNode } from 'react'
import { FacebookColoredIcon, MindsIcon, TwitterColoredIcon } from '@masknet/icons'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, ReactNode> = {
    'facebook.com': <FacebookColoredIcon />,
    'twitter.com': <TwitterColoredIcon />,
    'minds.com': <MindsIcon />,
}
