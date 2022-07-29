import { MaskMessages } from '../../utils'
import { hmr } from '../../../utils-pure'

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
