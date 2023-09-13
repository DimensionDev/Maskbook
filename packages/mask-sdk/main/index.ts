/// <reference path="../dist/public-api.d.ts" />
import { contentScript, readyPromise } from './bridge.js'
import { ethereum } from './wallet.js'

document.currentScript?.remove()
const promise = readyPromise.then((init) => {
    const MaskSDK: {
        [key in keyof typeof Mask as undefined extends (typeof Mask)[key] ? never : key]: (typeof Mask)[key]
    } = {
        sdkVersion: 0,
        ethereum,
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
