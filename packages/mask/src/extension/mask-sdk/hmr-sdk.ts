import { MaskMessages } from '../../utils'
import { startEffects } from '../../../utils-pure'

const { signal } = startEffects(import.meta.webpackHot)

try {
    if (process.env.NODE_ENV === 'development') {
        document.addEventListener(
            'mask-sdk-reload',
            () => MaskMessages.events.maskSDKHotModuleReload.sendToBackgroundPage(undefined),
            { signal },
        )
    }
} catch {}
