import {
    isTypedMessageAnchor,
    TypedMessage,
    TypedMessageAnchor,
    TypedMessageCompound,
} from '../../protocols/typed-message'
import { SearchResultInspector } from './UI/SearchResultInspector'
import { PluginConfig, PluginScope, PluginStage } from '../types'
import { LBP_PluginID } from './constants'
import { makeTypedMessageLBP } from './messages/TypedMessageLBP'
import { TagInspector } from './UI/TagInspector'

const isLBP_Message = (m: TypedMessage): m is TypedMessageAnchor =>
    isTypedMessageAnchor(m) && m.category === 'hash' && /#[\w\d]+lbp$/i.test(m.content)

export const LBP_PluginDefine: PluginConfig = {
    pluginName: 'LBP',
    identifier: LBP_PluginID,
    stage: PluginStage.Production,
    scope: PluginScope.Public,
    messageProcessor(message: TypedMessageCompound) {
        return {
            ...message,
            items: message.items.map((m: TypedMessage) => (isLBP_Message(m) ? makeTypedMessageLBP(m) : m)),
        }
    },
    PageComponent() {
        return (
            <>
                <TagInspector />
            </>
        )
    },
    SearchBoxComponent: SearchResultInspector,
}
