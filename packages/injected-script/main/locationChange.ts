import { $ } from './intrinsic.js'
import { PatchDescriptor } from './utils.js'

let currentLocationHref = window.location.href
PatchDescriptor(
    { __proto__: null!, pushState: { value: pushState }, replaceState: { value: replaceState } },
    $.HistoryPrototype,
)
// Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
function pushState(this: History, data: any, unused: string, url?: string | URL | null | undefined) {
    const val = $.apply($.pushState, this, arguments)
    $.dispatchEvent(window, new $.Event('locationchange'))
    if (currentLocationHref !== window.location.href) {
        currentLocationHref = window.location.href
        $.dispatchEvent(window, new $.Event('locationchange'))
    }
    return val
}
function replaceState(this: History, data: any, unused: string, url?: string | URL | null | undefined) {
    const val = $.apply($.replaceState, this, arguments)
    // cspell:ignore replacestate
    $.dispatchEvent(window, new $.Event('replacestate'))
    if (currentLocationHref !== window.location.href) {
        currentLocationHref = window.location.href
        $.dispatchEvent(window, new $.Event('replacestate'))
        $.dispatchEvent(window, new $.Event('locationchange'))
    }
    return val
}

window.addEventListener('popstate', () => {
    if (currentLocationHref === window.location.href) return
    currentLocationHref = window.location.href
    $.dispatchEvent(window, new $.Event('locationchange'))
})
