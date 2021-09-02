import type * as Mask from '../public-api'
// import { AsyncCall } from 'async-call-rpc/base.min'

document.currentScript?.remove()

// AsyncCall({}, { channel: {} as any })
const MaskSDK: typeof Mask = {
    sdkVersion: 0,
    socialNetwork: {} as any,
    credentials: {} as any,
    ethereum: {} as any,
    persona: {} as any,
}

try {
    // @ts-expect-error
    if (process.env.NODE_ENV === 'development') {
        // @ts-expect-error
        MaskSDK.reload = () => document.dispatchEvent(new Event('mask-sdk-reload'))
    }
} catch {}

Reflect.set(globalThis, 'Mask', MaskSDK)
