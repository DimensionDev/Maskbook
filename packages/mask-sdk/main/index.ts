import { readyPromise } from './bridge'
import { persona } from './persona'
import { SocialNetwork } from './socialNetwork'

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
        // @ts-expect-error
        if (process.env.NODE_ENV === 'development') {
            // @ts-expect-error
            MaskSDK.reload = () => document.dispatchEvent(new Event('mask-sdk-reload'))
        }
    } catch {}

    Reflect.set(globalThis, 'Mask', MaskSDK)
})
