import { readyPromise } from './bridge.js'
import { persona } from './persona.js'
import { SocialNetwork } from './socialNetwork.js'

document.currentScript?.remove()
readyPromise.then((init) => {
    const MaskSDK: typeof Mask = {
        sdkVersion: 0,
        credentials: {} as any,
        ethereum: {} as any,
        socialNetwork: new SocialNetwork(init),
        persona,
    }

    try {
        if (process.env.NODE_ENV === 'development') {
            // @ts-expect-error dev only
            MaskSDK.reload = () => globalThis.dispatchEvent(new Event('mask-sdk-reload'))
        }
    } catch {}

    Reflect.set(globalThis, 'Mask', MaskSDK)
})
