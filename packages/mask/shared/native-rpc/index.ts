import { AsyncCall, AsyncCallOptions, AsyncVersionOf } from 'async-call-rpc/full'
import { AndroidGeckoViewChannel } from './Android.channel'
import { iOSWebkitChannel } from './iOS.channel'
import type { AndroidNativeAPIs, iOSNativeAPIs } from '@masknet/public-api'

// This module won't be used in Web. Let it not effecting HMR.
if (process.env.architecture === 'web' && import.meta.webpackHot) import.meta.webpackHot.accept()
export const hasNativeAPI = process.env.architecture === 'app'
export let nativeAPI:
    | { type: 'iOS'; api: AsyncVersionOf<iOSNativeAPIs> }
    | { type: 'Android'; api: AsyncVersionOf<AndroidNativeAPIs> }
    | undefined = undefined

export let sharedNativeAPI: AsyncVersionOf<iOSNativeAPIs | AndroidNativeAPIs> | undefined = undefined
if (process.env.architecture === 'app') {
    const options: Partial<AsyncCallOptions> = {
        key: 'native',
        parameterStructures: 'by-name',
    }
    if (process.env.engine === 'safari') {
        const api = (sharedNativeAPI = AsyncCall<iOSNativeAPIs>(
            /**
             * Typescript will not add the file to the project dependency tree
             * but webpack will do constant folding
             */
            // @ts-ignore
            // eslint-disable-next-line no-useless-concat
            import('../../src/utils/native-rpc/' + 'Web.ts').then((x) => x.MaskNetworkAPI),
            {
                ...options,
                channel: new iOSWebkitChannel(),
            },
        ))
        nativeAPI = { type: 'iOS', api }
    } else if (process.env.engine === 'firefox') {
        const api = (sharedNativeAPI = AsyncCall<AndroidNativeAPIs>(
            // @ts-ignore
            // eslint-disable-next-line no-useless-concat
            import('../../src/utils/native-rpc/' + 'Web.ts').then((x) => x.MaskNetworkAPI),
            {
                ...options,
                channel: new AndroidGeckoViewChannel(),
            },
        ))
        nativeAPI = { type: 'Android', api }
    }
}
