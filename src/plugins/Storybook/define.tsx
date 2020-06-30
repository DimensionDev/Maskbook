import type { PluginConfig } from '../plugin'

export const StorybookPluginDefine: PluginConfig = {
    pluginName: 'Storybook test',
    identifier: 'storybook.debug',
    postDialogMetadataBadge: new Map([['test', (payload) => 'a lovely test badge']]),
}
