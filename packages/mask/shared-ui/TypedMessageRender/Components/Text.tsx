import { memo, type PropsWithChildren, useCallback } from 'react'
import { Typography, Link as MaterialLink } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message-react'
import { useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'

export const Container = memo(function Container(props: PropsWithChildren) {
    return (
        <Typography color="textPrimary" fontSize="inherit">
            {props.children}
        </Typography>
    )
})

export const Link = memo(function Anchor(props: RenderFragmentsContextType.LinkProps) {
    const text = props.children.startsWith('https://mask.io') ? 'Mask.io' : props.children
    return (
        <MaterialLink href={props.href} fontSize="inherit">
            {text}
            {props.suggestedPostImage}
        </MaterialLink>
    )
})

export function useTagEnhancer(kind: 'hash' | 'cash', content: string) {
    const plugin = useActivatedPluginsSiteAdaptor(false)
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
