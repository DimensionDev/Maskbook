import { NetworkPluginID, PostInfo } from '@masknet/plugin-infra'
import { Flags } from '../../../../../shared'
import { pluginIDSettings } from '../../../../settings/settings'
import { createPostActionsInjector } from '../../../../social-network/defaults/inject/PostActions'

export function injectPostActionsAtTwitter(signal: AbortSignal, postInfo: PostInfo) {
    if (!Flags.post_actions_enabled) return
    if (pluginIDSettings.value !== NetworkPluginID.PLUGIN_EVM && postInfo.actionsElement) {
        postInfo.actionsElement.after.style.display = 'none'
    }
    pluginIDSettings.addListener((newPluginId) => {
        if (!postInfo.actionsElement) return
        const isEvm = newPluginId === NetworkPluginID.PLUGIN_EVM
        postInfo.actionsElement.after.style.display = isEvm ? '' : 'none'
    })
    const injector = createPostActionsInjector()
    return injector(postInfo, signal)
}
