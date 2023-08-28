/// <reference path="../dist/public-api.d.ts" />
import { contentScript, readyPromise } from './bridge.js'
import { ethereum } from './wallet.js'
import { persona } from './persona.js'
import { SocialNetwork } from './socialNetwork.js'

document.currentScript?.remove()
const promise = readyPromise.then((init) => {
    const MaskSDK: typeof Mask = {
        sdkVersion: 0,
        credentials: undefined,
        ethereum,
        socialNetwork: new SocialNetwork(init),
        persona,
    }
    if (init.debuggerMode) {
        Object.assign(MaskSDK, { reload: () => contentScript.reload() })
    }
    Reflect.set(globalThis, 'Mask', MaskSDK)
    document.dispatchEvent(new CustomEvent('mask-sdk', { detail: MaskSDK }))
    return MaskSDK
})
if (!('Mask' in globalThis)) {
    Reflect.set(globalThis, 'Mask', promise)
}

undefined
