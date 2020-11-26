import { AsyncCall, AsyncCallOptions, _AsyncVersionOf } from 'async-call-rpc/full'
import { AndroidGeckoViewChannel } from './Android.channel'
import { iOSWebkitChannel } from './iOS.channel'
import { WebviewAPI } from './Web'
import type { AndroidNativeAPIs, iOSNativeAPIs } from './types'

export const hasNativeAPI = process.env.architecture === 'app'
export let nativeAPI:
    | { type: 'iOS'; api: _AsyncVersionOf<iOSNativeAPIs> }
    | { type: 'Android'; api: _AsyncVersionOf<AndroidNativeAPIs> }
    | undefined = undefined

export let sharedNativeAPI: _AsyncVersionOf<iOSNativeAPIs | AndroidNativeAPIs> | undefined = undefined
setup()
function setup() {
    if (process.env.architecture !== 'app') return
    const options: Partial<AsyncCallOptions> = { key: 'native' }
    if (process.env.target === 'safari') {
        const api = (sharedNativeAPI = AsyncCall<iOSNativeAPIs>(WebviewAPI, {
            ...options,
            channel: new iOSWebkitChannel(),
        }))
        nativeAPI = { type: 'iOS', api }
    } else if (process.env.target === 'firefox') {
        const api = (sharedNativeAPI = AsyncCall<AndroidNativeAPIs>(WebviewAPI, {
            ...options,
            channel: new AndroidGeckoViewChannel(),
        }))
        nativeAPI = { type: 'Android', api }
    }
}
