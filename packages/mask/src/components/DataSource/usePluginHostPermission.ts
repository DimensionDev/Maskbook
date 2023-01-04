import { useEffect } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import type { Plugin } from '@masknet/plugin-infra'
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

export function useCheckPermissions(permissions: string[]) {
    const asyncResult = useAsyncRetry(async () => {
        if (!permissions.length) return true
        return Services.Helper.hasHostPermission(permissions)
    }, [permissions])

    useEffect(() => MaskMessages.events.hostPermissionChanged.on(asyncResult.retry), [asyncResult.retry])

    return asyncResult
}

export function useGrantPermissions(permissions?: string[]) {
    return useAsyncFn(async () => {
        if (!permissions?.length) return
        return Services.Helper.requestHostPermission(permissions)
    }, [permissions])
}
