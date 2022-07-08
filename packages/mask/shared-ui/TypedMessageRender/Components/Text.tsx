import { memo, PropsWithChildren, useCallback } from 'react'
import { Typography, Link as MaterialLink } from '@mui/material'
import type { RenderFragmentsContextType } from '@masknet/typed-message/dom'
import { useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { useChainId } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'

export const Container = memo(function Container(props: PropsWithChildren<{}>) {
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
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const plugin = useActivatedPluginsSNSAdaptor('any')
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
            const cancel = plugin?.enhanceTag?.onHover?.(kind, content, event, chainId)
            event.currentTarget.addEventListener('mouseleave', () => cancel?.(), { once: true })
        },
        [plugin],
    )
    return { onClick, onMouseEnter, hasMatch: !!plugin }
}
