import React from 'react'
import { TypedMessage, TypedMessageAnchor, registerTypedMessageRenderer } from '../../../protocols/typed-message'

export interface TypedMessageCashTrending extends TypedMessage {
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

function DefaultTypedMessageCashTrendingRenderer() {
    return <a href="https://maskbook.com">MASKBOOK!</a>
}
