import { MaskMessage, startEffect } from '../../utils'

startEffect(import.meta.webpackHot, (signal) => {
    document.addEventListener(
        'mask-sdk-reload',
        () => MaskMessage.events.maskSDKHotModuleReload.sendToBackgroundPage(undefined),
        { signal },
    )
})
