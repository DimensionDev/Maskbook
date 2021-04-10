import { PluginConfig, PluginStage, PluginScope } from '../types'
import { registerTypedMessageRenderer, TypedMessage } from '../../protocols/typed-message'
import type { TypedMessageRendererProps } from '../../components/InjectedComponents/TypedMessageRenderer'

export const StorybookPluginDefine: PluginConfig = {
    ID: 'storybook.debug',
    pluginIcon: '📖',
    pluginName: 'Storybook test',
    pluginDescription: '',
    identifier: 'storybook.debug',
    stage: PluginStage.Development,
    scope: PluginScope.Internal,
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
