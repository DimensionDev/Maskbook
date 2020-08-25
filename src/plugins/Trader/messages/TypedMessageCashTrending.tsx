import React, { useState, useRef } from 'react'
import { TypedMessageAnchor, registerTypedMessageRenderer } from '../../../protocols/typed-message'
import { Link, Typography, Popper } from '@material-ui/core'
import type { TypedMessageRendererProps } from '../../../components/InjectedComponents/TypedMessageRenderer'
import { TrendingView } from '../UI/TrendingView'

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
    const rootEl = useRef<HTMLDivElement>(null)
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

    return (
        <div ref={rootEl} style={{ display: 'inline' }}>
            <Typography color="textPrimary" variant="body1" style={{ lineBreak: 'anywhere', display: 'inline' }}>
                <Link
                    href={props.message.href}
                    onMouseOver={(e: React.MouseEvent<HTMLAnchorElement>) => setAnchorEl(e.currentTarget)}>
                    {props.message.content}
                </Link>
            </Typography>
            <Popper
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                disablePortal
                container={() => rootEl.current}
                transition
                style={{ zIndex: 1 }}>
                <TrendingView keyword={props.message.name} />
            </Popper>
        </div>
    )
}
