import type { Plugin } from '@masknet/plugin-infra'
import { useEffect } from 'react'
import { useAsyncRetry } from 'react-use'
import Services from '../../extension/service.js'
import { MaskMessages } from '../../utils/messages.js'

export function usePluginHostPermissionCheck(plugins: Plugin.Shared.Definition[]) {
    // query if plugin is disabled due to lack of permission
    const { retry, value: lackPermission } = useAsyncRetry(async () => {
        const lackPermission = new Set<string>()
        await Promise.allSettled(
            plugins
                .filter((plugin) => plugin.enableRequirement.host_permissions)
                .map((plugin) =>
                    Services.Helper.hasHostPermission(plugin.enableRequirement.host_permissions!).then(
                        (result) => !result && lackPermission.add(plugin.ID),
                    ),
                ),
        )
        return lackPermission
    }, [plugins.map((x) => x.ID).join(',')])
    useEffect(() => MaskMessages.events.hostPermissionChanged.on(retry), [retry])
    return lackPermission
}
