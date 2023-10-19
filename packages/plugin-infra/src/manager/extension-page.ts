import { isEqual } from 'lodash-es'
import { ALL_EVENTS } from '@servie/events'
import { ValueRefWithReady } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { createManager } from './manage.js'
import type { Plugin } from '../types.js'

const { activated, startDaemon, events, minimalMode } = createManager((def) => def.ExtensionPage)

const activatedSub = new ValueRefWithReady<Plugin.ExtensionPage.Definition[]>([], isEqual)
events.on(ALL_EVENTS, () => (activatedSub.value = [...activated.plugins]))

const minimalModeSub = new ValueRefWithReady<string[]>([], isEqual)
events.on('minimalModeChanged', () => (minimalModeSub.value = [...minimalMode]))

export function useIsMinimalModeExtensionPage(pluginID: string) {
    return useValueRef(minimalModeSub).includes(pluginID)
}

export function useActivatedPluginsExtensionPage() {
    return useValueRef(activatedSub)
}

export function useActivatedPluginExtensionPage(pluginID: string) {
    const plugins = useValueRef(activatedSub)
    return plugins.find((x) => x.ID === pluginID)
}

export function startPluginHostExtensionPage(
    host: Plugin.__Host.Host<Plugin.ExtensionPage.Definition, Plugin.ExtensionPage.ExtensionPageContext>,
) {
    startDaemon(host)
}
