import { $, $Content } from './intrinsic.js'

let currentLocationHref = window.location.href
// Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
window.history.pushState = new $Content.Proxy(history.pushState, {
    __proto__: null,
    apply(pushState, thisArg, params: any) {
        const val = $.apply(pushState, thisArg, params)
        $Content.dispatchEvent(window, new $Content.Event('locationchange'))
        if (currentLocationHref !== window.location.href) {
            currentLocationHref = window.location.href
            $Content.dispatchEvent(window, new $Content.Event('locationchange'))
        }
        return val
    },
})
window.history.replaceState = new $Content.Proxy(history.replaceState, {
    __proto__: null,
    apply(replaceState, thisArg, params: any) {
        const val = $.apply(replaceState, thisArg, params)
        $Content.dispatchEvent(window, new $Content.Event('replacestate'))
        if (currentLocationHref !== window.location.href) {
            currentLocationHref = window.location.href
            $Content.dispatchEvent(window, new $Content.Event('replacestate'))
            $Content.dispatchEvent(window, new $Content.Event('locationchange'))
        }
        return val
    },
})

window.addEventListener('popstate', () => {
    if (currentLocationHref === window.location.href) return
    currentLocationHref = window.location.href
    $Content.dispatchEvent(window, new $Content.Event('locationchange'))
})
