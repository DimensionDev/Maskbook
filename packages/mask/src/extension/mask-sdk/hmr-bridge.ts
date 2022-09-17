import { maskSDKServer } from './bridge/index.js'

export const hmr_sdkServer = { ...maskSDKServer }

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./bridge', () => {
        for (const key of Object.keys(hmr_sdkServer)) {
            if (!(key in maskSDKServer)) Reflect.deleteProperty(hmr_sdkServer, key)
        }
        for (const key of Object.keys(maskSDKServer)) {
            // @ts-expect-error
            hmr_sdkServer[key] = maskSDKServer[key]
        }
    })
}
