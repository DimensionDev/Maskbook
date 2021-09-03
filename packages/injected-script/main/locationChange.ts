import { apply, dispatchEvent, no_xray_Event, no_xray_Proxy } from './intrinsic'

// Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
window.history.pushState = new no_xray_Proxy(history.pushState, {
    apply(target, thisArg, params: any) {
        const val = apply(target, thisArg, params)
        apply(dispatchEvent, window, [new no_xray_Event('pushstate')])
        apply(dispatchEvent, window, [new no_xray_Event('locationchange')])
        return val
    },
})
window.history.replaceState = new no_xray_Proxy(history.replaceState, {
    apply(target, thisArg, params: any) {
        const val = apply(target, thisArg, params)
        apply(dispatchEvent, window, [new no_xray_Event('replacestate')])
        apply(dispatchEvent, window, [new no_xray_Event('locationchange')])
        return val
    },
})

window.addEventListener('popstate', () => {
    apply(dispatchEvent, window, [new no_xray_Event('locationchange')])
})

export {}
