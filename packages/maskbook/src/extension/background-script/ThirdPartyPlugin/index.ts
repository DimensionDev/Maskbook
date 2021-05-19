import { ThirdPartyPluginPermission } from './types'

export function openPluginPopup(url: string) {
    new URL(url) // it must be a full qualified URL otherwise throws
    browser.windows.create({
        type: 'popup',
        width: 350,
        height: 600,
        url,
    })
}
export async function isSDKEnabled(baseURL: string) {
    return hasPermission(baseURL, [ThirdPartyPluginPermission.SDKEnabled])
}
export async function enableSDK(baseURL: string) {
    return grantPermission(baseURL, ThirdPartyPluginPermission.SDKEnabled)
}
/**
 * Check if the given URL has the permissions.
 */
export async function hasPermission(baseURL: string, permissions: ThirdPartyPluginPermission[]): Promise<boolean> {
    return permissions.every((p) => hasPermissionInternal(baseURL, p))
}

/**
 * Request permission for the given URL.
 *
 */
export async function requestPermission(baseURL: string, permissions: ThirdPartyPluginPermission[]): Promise<boolean> {
    return true
}

/**
 * DO NOT call this in the SDK. It should be called in the popups.
 *
 * Notice: In this demo implementation, all permissions are stored in the sessionStorage and will lost after the plugin refresh.
 */
export async function grantPermission(baseURL: string, permission: ThirdPartyPluginPermission) {
    sessionStorage.setItem(`plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`, '1')
}

/** @internal Do not export */
function hasPermissionInternal(baseURL: string, permission: ThirdPartyPluginPermission) {
    return !!sessionStorage.getItem(`plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`)
}
