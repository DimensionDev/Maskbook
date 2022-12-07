import { fetchText } from '@masknet/web3-providers/helpers'
import type { Storage } from 'webextension-polyfill'
// TODO: those types are defined in the plugin/External
type MaskSDK_SNS_ContextIdentifier = string
type Manifest = any

import {
    constructThirdPartyRequestPermissionURL,
    ThirdPartyPluginPermission,
} from '../../../shared/definitions/routes.js'

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
        if (process.env.manifest === '2') {
            ;(globalThis as any).sessionStorage.setItem(key, '1')
        } else {
            // @ts-expect-error Chrome Only API
            const session: Storage.StorageArea = browser.storage.session
            await session.set({ [key]: true })
        }
    }
}

/** @internal Do not export */
async function hasPermissionInternal(baseURL: string, permission: ThirdPartyPluginPermission) {
    const key = `plugin:${ThirdPartyPluginPermission[permission]}:${baseURL}`
    if (process.env.manifest === '2') {
        return !!(globalThis as any).sessionStorage.getItem(key)
    } else {
        // @ts-expect-error Chrome Only API
        const session: Storage.StorageArea = browser.storage.session
        return !!(await session.get(key))[key]
    }
}
