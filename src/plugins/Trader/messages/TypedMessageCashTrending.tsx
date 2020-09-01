import React from 'react'
import { TypedMessageAnchor, registerTypedMessageRenderer } from '../../../protocols/typed-message'
import { Link, Typography } from '@material-ui/core'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { MessageCenter } from '../messages'
import Services from '../../../extension/service'

export interface TypedMessageCashTrending extends Omit<TypedMessageAnchor, 'type'> {
    readonly type: 'anchor/cash_trending'
    readonly name: string
}

export function makeTypedMessageCashTrending(message: TypedMessageAnchor) {
    return {
        ...message,
        type: 'anchor/cash_trending',
        name: message.content.substr(1).toLowerCase(),
    } as TypedMessageCashTrending
}

registerTypedMessageRenderer('anchor/cash_trending', {
    component: DefaultTypedMessageCashTrendingRenderer,
    id: 'co.maskbook.trader.cash_trending',
    priority: 0,
})

function DefaultTypedMessageCashTrendingRenderer(props: TypedMessageRendererProps<TypedMessageCashTrending>) {
    const onHoverCashTag = async (ev: React.MouseEvent<HTMLAnchorElement>) => {
        // should cache before async operations
        const element = ev.currentTarget
        if (await Services.Plugin.invokePlugin('maskbook.trader', 'checkAvailability', props.message.name)) {
            MessageCenter.emit('cashTagObserved', {
                name: props.message.name,
                element,
            })
        }
    }
    return (
        <Typography component="span" color="textPrimary" variant="body1">
            <Link href={props.message.href} onMouseOver={onHoverCashTag}>
                {props.message.content}
            </Link>
        </Typography>
    )
}
