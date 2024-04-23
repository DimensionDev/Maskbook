import { useEffect } from 'react'
import { useAsyncFn, useAsyncRetry } from 'react-use'
import type { Plugin } from '@masknet/plugin-infra'
import { MaskMessages } from '@masknet/shared-base'
import Services from '#services'

export function usePluginHostPermissionCheck(plugins: Plugin.Shared.Definition[]) {
    const plugins_ = plugins.filter((x) => x.enableRequirement.host_permissions?.length)
    // query if plugin is disabled due to lack of permission
    const { retry, value: lackPermission } = useAsyncRetry(async () => {
        const lackPermission = new Set<string>()

        await Promise.allSettled(
            plugins_.map((plugin) =>
                Services.Helper.hasHostPermission(plugin.enableRequirement.host_permissions!).then(
                    (result) => !result && lackPermission.add(plugin.ID),
                ),
            ),
        )
        return lackPermission
    }, [plugins_.map((x) => x.ID).join(',')])

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
        return Services.Helper.requestExtensionPermissionFromContentScript({ origins: permissions })
    }, [permissions])
}
