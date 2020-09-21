import React, { useState } from 'react'
import { TypedMessageAnchor, registerTypedMessageRenderer } from '../../../protocols/typed-message'
import { Link, Typography } from '@material-ui/core'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { TraderMessageCenter } from '../messages'
import Services from '../../../extension/service'

export interface TypedMessageCashTrending extends Omit<TypedMessageAnchor, 'type'> {
    readonly type: 'x-cash-trending'
    readonly name: string
}

export function makeTypedMessageCashTrending(message: TypedMessageAnchor) {
    return {
        ...message,
        type: 'x-cash-trending',
        name: message.content.substr(1).toLowerCase(),
    } as TypedMessageCashTrending
}

registerTypedMessageRenderer('x-cash-trending', {
    component: DefaultTypedMessageCashTrendingRenderer,
    id: 'com.maskbook.trader.x-cash-trending',
    priority: 0,
})

function DefaultTypedMessageCashTrendingRenderer(props: TypedMessageRendererProps<TypedMessageCashTrending>) {
    const [openTimer, setOpenTimer] = useState<NodeJS.Timeout | null>(null)
    const onMouseOver = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        // cache for async operations
        const element = ev.currentTarget
        if (openTimer !== null) clearTimeout(openTimer)
        setOpenTimer(
            setTimeout(async () => {
                const availablePlatforms = await Services.Plugin.invokePlugin(
                    'maskbook.trader',
                    'getAvailableDataProviders',
                    props.message.name,
                )
                if (availablePlatforms.length)
                    TraderMessageCenter.emit('cashTagObserved', {
                        name: props.message.name,
                        element,
                        availablePlatforms,
                    })
            }, 500),
        )
    }
    const onMouseLeave = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        if (openTimer !== null) clearTimeout(openTimer)
    }
    const onClick = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        ev.stopPropagation()
    }
    return (
        <Typography component="span" color="textPrimary" variant="body1">
            <Link href={props.message.href} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} onClick={onClick}>
                {props.message.content}
            </Link>
        </Typography>
    )
}
