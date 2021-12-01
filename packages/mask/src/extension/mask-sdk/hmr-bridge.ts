import { maskSDKServer } from './bridge'

export const hmr_sdkServer = { ...maskSDKServer }

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./bridge', () => {
        for (const key in hmr_sdkServer) {
            if (!(key in maskSDKServer)) Reflect.deleteProperty(hmr_sdkServer, key)
        }
        for (const key in maskSDKServer) {
            // @ts-expect-error
            hmr_sdkServer[key] = maskSDKServer[key]
        }
    })
}
