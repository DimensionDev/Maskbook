import { fetchText } from '@masknet/web3-providers/helpers'
import type { Storage } from 'webextension-polyfill'

import {
    constructThirdPartyRequestPermissionURL,
    ThirdPartyPluginPermission,
} from '../../../shared/definitions/routes.js'
// TODO: those types are defined in the plugin/External
type MaskSDK_SNS_ContextIdentifier = string
type Manifest = any

export async function fetchManifest(addr: string): Promise<Manifest> {
    const text = await fetchText(addr + 'mask-manifest.json')

    // TODO: verify manifest
    return JSON.parse(
        text
            .split('\n')
            .filter((x) => !x.match(/^ +\/\//))
            .join('\n'),
    )
}
const hostedMeta = new Map<MaskSDK_SNS_ContextIdentifier, [string, unknown]>()
export async function getHostedMeta(context: MaskSDK_SNS_ContextIdentifier) {
    return hostedMeta.get(context)
}
export async function openPluginPopup(
    url: string,
    meta?: [context: MaskSDK_SNS_ContextIdentifier, metaKey: string, meta: unknown],
) {
    new URL(url) // it must be a full qualified URL otherwise throws
    if (meta) hostedMeta.set(meta[0], [meta[1], meta[2]])
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
/**
 * Check if the given URL has the permissions.
 */
export async function hasPermission(baseURL: string, permissions: ThirdPartyPluginPermission[]): Promise<boolean> {
    for (const permission of permissions) {
        if (!(await hasPermissionInternal(baseURL, permission))) return false
    }
    return true
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
    for (const permission of permissions) {
        const key = `plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`
        if (!('session' in browser.storage)) {
            sessionStorage.setItem(key, '1')
        } else {
            const session = browser.storage.session as Storage.StorageArea
            await session.set({ [key]: true })
        }
    }
}

// Note: sessionStorage is only available in MV2 or MV3 page mode.
const sessionStorage = (globalThis as any).sessionStorage

/** @internal Do not export */
async function hasPermissionInternal(baseURL: string, permission: ThirdPartyPluginPermission) {
    const key = `plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`
    if (!('session' in browser.storage)) {
        return !!sessionStorage.getItem(key)
    } else {
        const session = browser.storage.session as Storage.StorageArea
        return !!(await session.get(key))[key]
    }
}
