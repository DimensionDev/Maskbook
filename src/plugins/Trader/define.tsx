import React from 'react'
import type { PluginConfig } from '../plugin'
import {
    TypedMessage,
    isTypedMessgaeAnchor,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { TrendingPopper } from './UI/TrendingPopper'
import { TrendingView } from './UI/TrendingView'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor => isTypedMessgaeAnchor(m) && m.category === 'cash'

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: 'co.maskbook.trader',
    postDialogMetadataBadge: new Map([['com.maskbook.trader:1', (meta) => 'no metadata']]),
    postMessageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        }
    },
    pageInspector() {
        return (
            <TrendingPopper>
                {(name: string) => {
                    return <TrendingView name={name}></TrendingView>
                }}
            </TrendingPopper>
        )
    },
}
