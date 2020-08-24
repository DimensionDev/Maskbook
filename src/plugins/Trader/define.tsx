import React, { Suspense } from 'react'
import type { PluginConfig } from '../plugin'
import {
    TypedMessage,
    isTypedMessgaeAnchor,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { TrendingView } from './UI/TrendingView'
import MaskbookPluginWrapper from '../MaskbookPluginWrapper'

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
    postInspector() {
        return (
            <MaskbookPluginWrapper pluginName="Trader">
                <Suspense fallback={null}>
                    <TrendingView keyword="BTC"></TrendingView>
                </Suspense>
            </MaskbookPluginWrapper>
        )
    },
}
