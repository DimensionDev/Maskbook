import type { PluginConfig } from '../plugin'
import type { PollMetaData } from './types'

export const PollsPluginDefine: PluginConfig = {
    pluginName: 'Poll',
    identifier: 'com.maskbook.poll',
    postDialogMetadataBadge: new Map([
        ['poll', (meta: PollMetaData) => `a poll of '${meta.question}' from ${meta.sender}`],
    ]),
}
