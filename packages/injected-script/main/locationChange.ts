import { $Content, $ } from './intrinsic.js'

function setupChromium() {
    let currentLocationHref = window.location.href
    // Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
    window.history.pushState = new $Content.Proxy(history.pushState, {
        apply(target, thisArg, params: any) {
            const val = $.Reflect.apply(target, thisArg, params)
            $Content.dispatchEvent(window, new $Content.Event('locationchange'))
            if (currentLocationHref !== window.location.href) {
                currentLocationHref = window.location.href
                $Content.dispatchEvent(window, new $Content.Event('locationchange'))
            }
            return val
        },
    })
    window.history.replaceState = new $Content.Proxy(history.replaceState, {
        apply(target, thisArg, params: any) {
            const val = $.Reflect.apply(target, thisArg, params)
            $Content.dispatchEvent(window, new $Content.Event('replacestate'))
            if (currentLocationHref !== window.location.href) {
                currentLocationHref = window.location.href
                $Content.dispatchEvent(window, new $Content.Event('replacestate'))
            }
            return val
        },
    })

    window.addEventListener('popstate', () => {
        if (currentLocationHref === window.location.href) return
        currentLocationHref = window.location.href
        $Content.dispatchEvent(window, new $Content.Event('locationchange'))
    })
}

function setupGecko() {
    let lastURL = location.href

    new MutationObserver(() => {
        const url = location.href
        if (url !== lastURL) {
            lastURL = url
            onLocationChange()
        }
    }).observe(document, { subtree: true, childList: true })

    function onLocationChange() {
        $Content.dispatchEvent(window, new $Content.Event('locationchange'))
    }
}

;(() => {
    const isFF = navigator.userAgent.toLowerCase().includes('firefox')
    if (isFF) setupGecko()
    setupChromium()
})()
