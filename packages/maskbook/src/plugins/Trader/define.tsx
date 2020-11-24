import { PluginConfig, PluginStage, PluginScope } from '../types'
import {
    TypedMessage,
    isTypedMessageAnchor,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { makeTypedMessageCashTrending } from './messages/TypedMessageCashTrending'
import { PageInspector } from './UI/PageInspector'
import { PLUGIN_IDENTIFIER } from './constants'
import { SettingsDialog } from './UI/trader/SettingsDialog'

const isCashTagMessage = (m: TypedMessage): m is TypedMessageAnchor => isTypedMessageAnchor(m) && m.category === 'cash'

export const TraderPluginDefine: PluginConfig = {
    pluginName: 'Trader',
    identifier: PLUGIN_IDENTIFIER,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    messageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isCashTagMessage(m) ? makeTypedMessageCashTrending(m) : m)),
        }
    },
    PageComponent() {
        return (
            <>
                <PageInspector />
                <SettingsDialog />
            </>
        )
    },
    DashboardComponent() {
        return (
            <>
                <SettingsDialog />
            </>
        )
    },
}
