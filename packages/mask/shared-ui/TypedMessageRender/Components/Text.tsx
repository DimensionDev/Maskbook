import { memo } from 'react'
import { Typography, Link } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'

export const Text = memo(function Text(props: RenderFragmentsContextType.TextProps) {
    return (
        <Typography
            sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined, display: 'inline' }}
            children={props.children}
        />
    )
})

export const Anchor = memo(function Anchor(props: RenderFragmentsContextType.LinkProps) {
    return (
        <Link
            sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
            href={props.href}
            children={props.children}
        />
    )
})
