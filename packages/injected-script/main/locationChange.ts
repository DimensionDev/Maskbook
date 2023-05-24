import { $, $unsafe } from './intrinsic.js'

let currentLocationHref = window.location.href
// Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
window.history.pushState = new $unsafe.Proxy(history.pushState, {
    __proto__: null,
    apply(pushState, thisArg, params: any) {
        const val = $.apply(pushState, thisArg, params)
        $.dispatchEvent(window, new $unsafe.Event('locationchange'))
        if (currentLocationHref !== window.location.href) {
            currentLocationHref = window.location.href
            $.dispatchEvent(window, new $unsafe.Event('locationchange'))
        }
        return val
    },
})
window.history.replaceState = new $unsafe.Proxy(history.replaceState, {
    __proto__: null,
    apply(replaceState, thisArg, params: any) {
        const val = $.apply(replaceState, thisArg, params)
        $.dispatchEvent(window, new $unsafe.Event('replacestate'))
        if (currentLocationHref !== window.location.href) {
            currentLocationHref = window.location.href
            $.dispatchEvent(window, new $unsafe.Event('replacestate'))
            $.dispatchEvent(window, new $unsafe.Event('locationchange'))
        }
        return val
    },
})

window.addEventListener('popstate', () => {
    if (currentLocationHref === window.location.href) return
    currentLocationHref = window.location.href
    $.dispatchEvent(window, new $unsafe.Event('locationchange'))
})
