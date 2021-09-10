import type { BridgeAPI } from '@masknet/sdk'
import { ExternalPluginMessages } from '../../../plugins/External/messages'
import type { MaskSDK_SNS_ContextIdentifier } from '../../../plugins/External/sns-context'
import { SDKErrors } from '../constants'

export const SNSMethods: Pick<BridgeAPI, 'sns_appendComposition'> = {
    async sns_appendComposition(message: string, payload = new Map()) {
        const context = await __validateRemoteContext()

        const url = currentBaseURL.replace(/^https?:\/\//, '')
        const namespacedPayload = new Map<string, unknown>()
        for (const key of payload.keys()) {
            // plugin:dimensiondev.github.io/Mask-Plugin-Example/@v1
            namespacedPayload.set(`plugin:${url}@${key}`, payload.get(key))
        }

        ExternalPluginMessages.appendComposition.sendToContentScripts({
            payload: namespacedPayload,
            context,
            appendText: message,
        })
    },
}
export const currentSNSContext = new URL(location.href).searchParams.get(
    'mask_context',
) as MaskSDK_SNS_ContextIdentifier | null

export const currentBaseURL = new URL('./', location.href).toString()

async function __assertLocalContext() {
    if (!currentSNSContext) throw new Error(SDKErrors.M1_Lack_context_identifier)
}
function __validateRemoteContext() {
    if (isContextDisconnected) return Promise.reject(new Error(SDKErrors.M2_Context_disconnected))

    return new Promise<MaskSDK_SNS_ContextIdentifier>((resolve, reject) => {
        if (!currentSNSContext) throw onContextDisconnected()
        const challenge = Math.random()
        const f = ExternalPluginMessages.pong.on((i) => {
            if (i !== challenge) return
            resolve(currentSNSContext!)
            f()
        })
        ExternalPluginMessages.ping.sendToContentScripts({
            context: currentSNSContext,
            challenge,
        })
        setTimeout(() => reject(onContextDisconnected()), 2000)
    })
}

let isContextDisconnected = false
function onContextDisconnected() {
    isContextDisconnected = true
    document.dispatchEvent(new Event('mask-sdk-disconnected'))
    return new Error(SDKErrors.M2_Context_disconnected)
}
