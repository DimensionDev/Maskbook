import { useEffect } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import { useSiteAdaptorContext } from '@masknet/plugin-infra/content-script'

export function usePluginHostPermissionCheck(plugins: Plugin.Shared.Definition[]) {
    const { hasHostPermission } = useSiteAdaptorContext()
    const plugins_ = plugins.filter((x) => x.enableRequirement.host_permissions?.length)
    // query if plugin is disabled due to lack of permission
    const { retry, value: lackPermission } = useAsyncRetry(async () => {
        const lackPermission = new Set<string>()

        await Promise.allSettled(
            plugins_.map(
                (plugin) =>
                    hasHostPermission?.(plugin.enableRequirement.host_permissions!).then(
                        (result) => !result && lackPermission.add(plugin.ID),
                    ),
            ),
        )
        return lackPermission
    }, [plugins_.map((x) => x.ID).join(','), hasHostPermission])

    useEffect(() => MaskMessages.events.hostPermissionChanged.on(retry), [retry])
    return lackPermission
}

export function useCheckPermissions(permissions: string[]) {
    const { hasHostPermission } = useSiteAdaptorContext()
    const asyncResult = useAsyncRetry(async () => {
        if (!permissions.length) return true
        return hasHostPermission?.(permissions)
    }, [permissions, hasHostPermission])

    useEffect(() => MaskMessages.events.hostPermissionChanged.on(asyncResult.retry), [asyncResult.retry])

    return asyncResult
}

export function useGrantPermissions(permissions?: string[]) {
    const { requestHostPermission } = useSiteAdaptorContext()
    return useAsyncFn(async () => {
        if (!permissions?.length) return
        return requestHostPermission?.(permissions)
    }, [permissions, requestHostPermission])
}
