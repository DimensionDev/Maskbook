import type { Mask } from '../public-api/index.js'
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

    Object.assign(globalThis, { Mask: MaskSDK })
    return MaskSDK
})
if (!('Mask' in globalThis)) Object.assign(globalThis, { Mask: promise })

undefined
