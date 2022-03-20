import { memo, useCallback } from 'react'
import { Typography, Link as MaterialLink } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra'

export const Container = memo(function Container(props) {
    return (
        <Typography color="textPrimary" fontSize="inherit">
            {props.children}
        </Typography>
    )
})

export const Link = memo(function Anchor(props: RenderFragmentsContextType.LinkProps) {
    let text = props.children
    if (text.startsWith('https://mask.io')) {
        text = 'Mask.io'
    }
    return <MaterialLink href={props.href} children={text} />
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
