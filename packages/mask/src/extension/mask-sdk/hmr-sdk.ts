import { MaskMessages, startEffect } from '../../utils'

startEffect(import.meta.webpackHot, (signal) => {
    if (process.env.NODE_ENV === 'development') {
        document.addEventListener(
            'mask-sdk-reload',
            () => MaskMessages.events.maskSDKHotModuleReload.sendToBackgroundPage(undefined),
            { signal },
        )
    }
})
