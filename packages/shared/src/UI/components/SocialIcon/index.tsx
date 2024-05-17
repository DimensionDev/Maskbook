import type { ComponentType, HTMLProps } from 'react'
import { type GeneratedIconProps, Icons } from '@masknet/icons'

const socialIconMap = {
    'twitter.com': Icons.Twitter,
    'x.com': Icons.Twitter,
    'github.com': Icons.GitHub,
    default: Icons.Globe,
} satisfies Record<string, ComponentType<GeneratedIconProps>>

interface Props extends HTMLProps<HTMLDivElement> {
    /** Social url */
    url?: string
}
export function SocialIcon({ url, ...rest }: Props) {
    if (!url) return null

    const host = new URL(url).host as keyof typeof socialIconMap

    const Icon = socialIconMap[host] ?? socialIconMap.default

    return <Icon {...rest} />
}
