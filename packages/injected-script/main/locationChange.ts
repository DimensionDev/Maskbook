import { $, $unsafe } from './intrinsic.js'
import { PatchDescriptor } from './utils.js'

let currentLocationHref = window.location.href
PatchDescriptor(
    { __proto__: null!, pushState: { value: pushState }, replaceState: { value: replaceState } },
    $unsafe.HistoryPrototype,
)
// Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
function pushState(this: History, data: any, unused: string, url?: string | URL | null | undefined) {
    const val = $.apply($unsafe.pushState, this, arguments)
    $.dispatchEvent(window, new $unsafe.Event('locationchange'))
    if (currentLocationHref !== window.location.href) {
        currentLocationHref = window.location.href
        $.dispatchEvent(window, new $unsafe.Event('locationchange'))
    }
    return val
}
function replaceState(this: History, data: any, unused: string, url?: string | URL | null | undefined) {
    const val = $.apply($unsafe.replaceState, this, arguments)
    $.dispatchEvent(window, new $unsafe.Event('replacestate'))
    if (currentLocationHref !== window.location.href) {
        currentLocationHref = window.location.href
        $.dispatchEvent(window, new $unsafe.Event('replacestate'))
        $.dispatchEvent(window, new $unsafe.Event('locationchange'))
    }
    return val
}

window.addEventListener('popstate', () => {
    if (currentLocationHref === window.location.href) return
    currentLocationHref = window.location.href
    $.dispatchEvent(window, new $unsafe.Event('locationchange'))
})
