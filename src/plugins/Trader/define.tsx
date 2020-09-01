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
import Services from '../../extension/service'
import { Platform } from './types'
import { getEnumAsArray } from '../../utils/enum'
import { PLUGIN_IDENTIFIER, PLUGIN_METADATA_KEY } from './constants'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor => isTypedMessgaeAnchor(m) && m.category === 'cash'

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: PLUGIN_IDENTIFIER,
    postDialogMetadataBadge: new Map([[PLUGIN_METADATA_KEY, (meta) => 'no metadata']]),
    postMessageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        }
    },
    pageInspector() {
        // build availability cache in the background page
        getEnumAsArray(Platform).forEach((p) =>
            Services.Plugin.invokePlugin('maskbook.trader', 'checkAvailability', 'BTC'),
        )
        return (
            <TrendingPopper>
                {(name: string, reposition?: () => void) => <TrendingView name={name} onUpdate={reposition} />}
            </TrendingPopper>
        )
    },
}
