import { persona } from './persona'
document.currentScript?.remove()

const MaskSDK: typeof Mask = {
    sdkVersion: 0,
    socialNetwork: {} as any,
    credentials: {} as any,
    ethereum: {} as any,
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
