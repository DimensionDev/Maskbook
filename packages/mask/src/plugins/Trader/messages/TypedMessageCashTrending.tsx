import { useState } from 'react'
import { Link, Typography } from '@mui/material'
import { TypedMessageAnchor, TypedMessage, isTypedMessageAnchor } from '@masknet/typed-message'
import { PluginTraderMessages, PluginTraderRPC } from '../messages'
import { TagType } from '../types'
// TODO: when migrate, should have an API in the plugin infra for plugin to define render
import { TypedMessageRenderRegistry } from '../../../../shared-ui/TypedMessageRender/registry'

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
TypedMessageRenderRegistry.registerTypedMessageRender('x-cash-trending', {
    component: CashTrendingRenderer,
    id: Symbol('com.mask.trader.x-cash-trending'),
    priority: 0,
})

function CashTrendingRenderer(props: TypedMessageCashTrending) {
    const [openTimer, setOpenTimer] = useState<ReturnType<typeof setTimeout> | null>(null)
    const onMouseOver = (ev: React.MouseEvent<HTMLAnchorElement>) => {
        // cache for async operations
        const element = ev.currentTarget
        if (openTimer !== null) clearTimeout(openTimer)
        setOpenTimer(
            setTimeout(async () => {
                if (props.category !== 'cash' && props.category !== 'hash') return
                const { name, category } = props
                const type = category === 'cash' ? TagType.CASH : TagType.HASH
                const dataProviders = await PluginTraderRPC.getAvailableDataProviders(type, name)
                if (!dataProviders.length) return
                PluginTraderMessages.cashTagObserved.sendToLocal({
                    name,
                    type,
                    element,
                    dataProviders,
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
            <Link href={props.href} onMouseOver={onMouseOver} onMouseLeave={onMouseLeave} onClick={onClick}>
                {props.content}
            </Link>
        </Typography>
    )
}
