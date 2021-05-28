import type { ThirdPartyPopupContextIdentifier } from '../../../plugins/External/popup-context'
import { MaskMessage } from '../../../utils'
import { currentPopupContext, SDKErrors } from '../constant'

/** @internal */
export async function __assertLocalContext() {
    if (!currentPopupContext) throw new Error(SDKErrors.M1_Lack_context_identifier)
}

/** @internal To make sure the remote context still alive */
export function __validateRemoteContext() {
    if (isContextDisconnected) return Promise.reject(new Error(SDKErrors.M2_Context_disconnected))

    return new Promise<ThirdPartyPopupContextIdentifier>((resolve, reject) => {
        if (!currentPopupContext) throw onContextDisconnected()
        const challenge = Math.random()
        const f = MaskMessage.events.thirdPartyPong.on((i) => {
            if (i !== challenge) return
            resolve(currentPopupContext!)
            f()
        })
        MaskMessage.events.thirdPartyPing.sendToContentScripts({
            context: currentPopupContext,
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
