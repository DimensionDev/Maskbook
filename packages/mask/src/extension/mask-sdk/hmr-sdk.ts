import { MaskMessages } from '../../utils/index.js'
import { hmr } from '../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)

try {
    if (process.env.NODE_ENV === 'development') {
        globalThis.addEventListener(
            'mask-sdk-reload',
            () => MaskMessages.events.maskSDKHotModuleReload.sendToBackgroundPage(undefined),
            { signal },
        )
    }
} catch {}
