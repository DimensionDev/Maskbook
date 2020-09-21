import React from 'react'
import type { PluginConfig } from '../plugin'
import {
    TypedMessage,
    isTypedMessageAnchor,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { PageInspector } from './UI/PageInspector'
import { PLUGIN_IDENTIFIER, PLUGIN_METADATA_KEY } from './constants'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor => isTypedMessageAnchor(m) && m.category === 'cash'

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: PLUGIN_IDENTIFIER,
    postDialogMetadataBadge: new Map([[PLUGIN_METADATA_KEY, (meta) => 'no metadata']]),
    messageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        }
    },
    pageInspector() {
        return <PageInspector />
    },
}
