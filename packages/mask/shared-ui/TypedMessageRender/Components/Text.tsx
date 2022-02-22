import { memo, useCallback } from 'react'
import { Typography, Link as MaterialLink } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

export const Text = memo(function Text(props: RenderFragmentsContextType.TextProps) {
    return (
        <Typography
            sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined, display: 'inline' }}
            children={props.children}
        />
    )
})

export const Link = memo(function Anchor(props: RenderFragmentsContextType.LinkProps) {
    return (
        <MaterialLink
            sx={{ fontSize: props.fontSize ? `${Math.max(props.fontSize, 14)}px` : undefined }}
            href={props.href}
            children={props.children}
        />
    )
})

export function useTagEnhancer(kind: 'hash' | 'cash', content: string) {
    const plugin = useActivatedPluginsSNSAdaptor(false)
        .filter((x) => x.enhanceTag)
        .at(0)

    const onClick: React.EventHandler<React.MouseEvent<HTMLAnchorElement>> = useCallback(
        (event) => {
            plugin?.enhanceTag?.onClick?.(kind, content, event)
        },
        [plugin],
    )
    const onMouseEnter: React.EventHandler<React.MouseEvent<HTMLAnchorElement>> = useCallback(
        (event) => {
            const cancel = plugin?.enhanceTag?.onHover?.(kind, content, event)
            event.currentTarget.addEventListener('mouseleave', () => cancel?.(), { once: true })
        },
        [plugin],
    )
    return { onClick, onMouseEnter, hasMatch: !!plugin }
}
