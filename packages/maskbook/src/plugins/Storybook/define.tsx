import type { PluginConfig } from '../plugin'
import { registerTypedMessageRenderer, TypedMessage } from '../../protocols/typed-message'
import type { TypedMessageRendererProps } from '../../components/InjectedComponents/TypedMessageRenderer'
import React from 'react'

export const StorybookPluginDefine: PluginConfig = {
    pluginName: 'Storybook test',
    identifier: 'storybook.debug',
    postDialogMetadataBadge: new Map([['test', (payload) => 'a lovely test badge']]),
}
if (process.env.STORYBOOK) {
    registerTypedMessageRenderer('test', { component: TypedMessageRenderTest, id: 'test', priority: 0 })
}
export interface TypedMessageStorybookTest extends TypedMessage {
    readonly type: 'test'
    readonly payload: string
}
function TypedMessageRenderTest(props: TypedMessageRendererProps<TypedMessageStorybookTest>) {
    return (
        <div>
            Hi, it's a test TypeMessage renderer. It is containing the following payload:
            <br />
            <code>{props.message.payload}</code>
        </div>
    )
}
