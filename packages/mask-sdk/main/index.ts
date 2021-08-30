import type * as Mask from '../public-api'
import { AsyncCall } from 'async-call-rpc/base.min'

AsyncCall({}, { channel: {} as any })
const MaskSDK: typeof Mask = {
    version: '__VERSION__',
    sdkVersion: 0,
    socialNetwork: {} as any,
    credentials: {} as any,
    ethereum: {} as any,
    persona: {} as any,
}

Reflect.set(globalThis, 'Mask', MaskSDK)
