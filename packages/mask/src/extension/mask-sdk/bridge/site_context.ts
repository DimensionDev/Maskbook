import type { BridgeAPI } from '@masknet/sdk'
import { ExternalPluginMessages, type MaskSDK_Site_ContextIdentifier } from '@masknet/plugin-external'
import { SDKErrors } from '../constants.js'

export const SiteMethods = {
    async site_appendComposition(message: string, payload = new Map()) {
        const context = await __validateRemoteContext()

        const url = currentBaseURL.replace(/^https?:\/\//, '')
        const namespacedPayload = new Map<string, unknown>()
        for (const key of payload.keys()) {
            // plugin:dimensiondev.github.io/Mask-Plugin-Example/@v1
            namespacedPayload.set(`plugin:${url}@${key}`, payload.get(key))
        }

        ExternalPluginMessages.appendComposition.sendToContentScripts?.({
            payload: namespacedPayload,
            context,
            appendText: message,
        })
    },
} satisfies Partial<BridgeAPI>
export const currentSiteContext = new URL(location.href).searchParams.get(
    'mask_context',
) as MaskSDK_Site_ContextIdentifier | null

export const currentBaseURL = new URL('./', location.href).toString()

async function __assertLocalContext() {
    if (!currentSiteContext) throw new Error(SDKErrors.M1_Lack_context_identifier)
}
function __validateRemoteContext() {
    if (isContextDisconnected) return Promise.reject(new Error(SDKErrors.M2_Context_disconnected))

    return new Promise<MaskSDK_Site_ContextIdentifier>((resolve, reject) => {
        if (!currentSiteContext) throw onContextDisconnected()
        const challenge = Math.random()
        const f = ExternalPluginMessages.pong.on((i) => {
            if (i !== challenge) return
            resolve(currentSiteContext)
            f()
        })
        ExternalPluginMessages.ping.sendToContentScripts?.({
            context: currentSiteContext,
            challenge,
        })
        setTimeout(() => reject(onContextDisconnected()), 2000)
    })
}

let isContextDisconnected = false
function onContextDisconnected() {
    isContextDisconnected = true
    globalThis.dispatchEvent(new Event('mask-sdk-disconnected'))
    return new Error(SDKErrors.M2_Context_disconnected)
}
