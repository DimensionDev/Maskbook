import type { Manifest } from '../../../plugins/External/types'
import { constructThirdPartyRequestPermissionURL } from '../../popups/ThirdPartyRequestPermission/utils'
import { ThirdPartyPluginPermission } from './types'

export async function fetchManifest(addr: string): Promise<Manifest> {
    const response = await fetch(addr + 'mask-manifest.json')
    const json = await response.text().then(JSONC)
    // TODO: verify manifest
    return JSON.parse(json)

    function JSONC(x: string) {
        return x
            .split('\n')
            .filter((x) => !x.match(/^ +\/\//))
            .join('\n')
    }
}
export async function openPluginPopup(url: string) {
    new URL(url) // it must be a full qualified URL otherwise throws
    const { id: windowID } = await browser.windows.create({
        type: 'popup',
        width: 350,
        height: 600,
        url,
    })
    return new Promise<void>((resolve) => {
        browser.windows.onRemoved.addListener(function listener(id) {
            if (id !== windowID) return
            browser.windows.onRemoved.removeListener(listener)
            resolve()
        })
    })
}
export async function isSDKEnabled(baseURL: string) {
    return hasPermission(baseURL, [ThirdPartyPluginPermission.SDKEnabled])
}
export async function enableSDK(baseURL: string) {
    return grantPermission(baseURL, [ThirdPartyPluginPermission.SDKEnabled])
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
    if (await hasPermission(baseURL, permissions)) return true
    await openPluginPopup(constructThirdPartyRequestPermissionURL(baseURL, permissions))
    return hasPermission(baseURL, permissions)
}

/**
 * DO NOT call this in the SDK. It should be called in the popups.
 *
 * Notice: In this demo implementation, all permissions are stored in the sessionStorage and will lost after the plugin refresh.
 */
export async function grantPermission(baseURL: string, permissions: ThirdPartyPluginPermission[]) {
    for (const permission of permissions)
        sessionStorage.setItem(`plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`, '1')
}

/** @internal Do not export */
function hasPermissionInternal(baseURL: string, permission: ThirdPartyPluginPermission) {
    return !!sessionStorage.getItem(`plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`)
}
