import type { ReactNode } from 'react'
import { FacebookColoredIcon, MindsIcon, TwitterColoredIcon } from '@masknet/icons'

export const SOCIAL_MEDIA_ICON_MAPPING: Record<string, ReactNode> = {
    'twitter.com': <TwitterColoredIcon />,
    'facebook.com': <FacebookColoredIcon />,
    'minds.com': <MindsIcon />,
}
