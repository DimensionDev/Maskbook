/// <reference path="../dist/public-api.d.ts" />
import { contentScript, readyPromise } from './bridge.js'
import { ethereum } from './wallet.js'

document.currentScript?.remove()
const promise = readyPromise.then((init) => {
    const MaskSDK: {
        [key in keyof typeof Mask as undefined extends (typeof Mask)[key] ? never : key]: (typeof Mask)[key]
    } & { reload?(): Promise<void> } = {
        sdkVersion: 0,
        ethereum,
    }

    if (init.debuggerMode) MaskSDK.reload = () => contentScript.reload()

    globalThis.Mask = MaskSDK as any
    return MaskSDK
})
if (!('Mask' in globalThis)) globalThis.Mask = promise as any

undefined
