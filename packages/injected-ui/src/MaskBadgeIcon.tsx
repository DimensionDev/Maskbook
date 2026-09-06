import { Icons } from '@masknet/icons'

export interface MaskBadgeIconProps {
    size: number
}

/**
 * The small Mask badge injected next to a linked account's name/avatar on X/Twitter (profile,
 * floating bio card, and posts) to mark it as Mask-enabled.
 */
export function MaskBadgeIcon({ size }: MaskBadgeIconProps) {
    return (
        <Icons.MaskBlue
            size={size}
            style={{
                verticalAlign: 'text-bottom',
                marginLeft: 6,
            }}
        />
    )
}
