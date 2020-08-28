import React from 'react'
import { TypedMessageAnchor, registerTypedMessageRenderer } from '../../../protocols/typed-message'
import { Link, Typography } from '@material-ui/core'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { MessageCenter } from '../messages'

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
    const onHoverCashTag = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        MessageCenter.emit('cashTagObserved', {
            name: props.message.name,
            element: ev.currentTarget,
        })
    }

    return (
        <Typography component="span" color="textPrimary" variant="body1">
            <Link href={props.message.href} onMouseOver={onHoverCashTag}>
                {props.message.content}
            </Link>
        </Typography>
    )
}
