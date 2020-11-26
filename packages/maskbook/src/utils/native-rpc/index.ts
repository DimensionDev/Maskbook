import { AsyncCall, AsyncCallOptions, _AsyncVersionOf } from 'async-call-rpc/full'
import { AndroidGeckoViewChannel } from './Android.channel'
import { iOSWebkitChannel } from './iOS.channel'
import { WebviewAPI } from './Web'
import type { AndroidNativeAPIs, iOSNativeAPIs } from './types'
import { timeout } from '../utils'

export const hasNativeAPI = process.env.architecture === 'app'
export let nativeAPI:
    | { type: 'iOS'; api: _AsyncVersionOf<iOSNativeAPIs> }
    | { type: 'Android'; api: _AsyncVersionOf<AndroidNativeAPIs> }
    | undefined = undefined

export let sharedNativeAPI: _AsyncVersionOf<iOSNativeAPIs | AndroidNativeAPIs> | undefined = undefined
if (process.env.architecture === 'app') {
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
        const data = 'hello! android should echo this message as-is'
        timeout(api.android_echo(data), 1000).then(
            (x: string) =>
                x === data
                    ? console.log('Android implemented android_echo correctly')
                    : console.error('Android did not implemented android_echo correctly, received', x),
            (err) => console.error('api.android_echo reports an error:', err),
        )
    }
}
