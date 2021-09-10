import { maskSDKServer } from './bridge'
import type { BridgeAPI } from '@masknet/sdk'

export const hmr_sdkServer = { ...maskSDKServer }

if (import.meta.webpackHot) {
    import.meta.webpackHot.accept('./bridge', () => {
        for (const key in hmr_sdkServer) {
            if (!(key in maskSDKServer)) Reflect.deleteProperty(hmr_sdkServer, key)
        }
        for (const key in maskSDKServer) {
            hmr_sdkServer[key as keyof BridgeAPI] = maskSDKServer[key as keyof BridgeAPI]
        }
    })
}
