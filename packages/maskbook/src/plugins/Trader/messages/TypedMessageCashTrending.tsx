import { useState } from 'react'
import {
    TypedMessageAnchor,
    registerTypedMessageRenderer,
    TypedMessage,
    isTypedMessageAnchor,
} from '../../../protocols/typed-message'
import { Link, Typography } from '@material-ui/core'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { PluginTraderMessages, PluginTraderRPC } from '../messages'
import { TagType } from '../types'

export interface TypedMessageCashTrending extends Omit<TypedMessageAnchor, 'type'> {
    readonly type: 'x-cash-trending'
    readonly name: string
}

export const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor =>
    isTypedMessageAnchor(m) && ['cash', 'hash'].includes(m.category) && !/#\w+lbp$/i.test(m.content)
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
                if (props.message.category !== 'cash' && props.message.category !== 'hash') return
                const { name, category } = props.message
                const type = category === 'cash' ? TagType.CASH : TagType.HASH
                const dataProviders = await PluginTraderRPC.getAvailableDataProviders(type, name)
                const tradeProviders = await PluginTraderRPC.getAvailableTraderProviders(type, name)
                if (!dataProviders.length) return
                PluginTraderMessages.cashTagObserved.sendToLocal({
                    name,
                    type,
                    element,
                    dataProviders,
                    tradeProviders,
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
