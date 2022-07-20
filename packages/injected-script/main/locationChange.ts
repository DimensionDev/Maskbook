import { $NoXRay, $ } from './intrinsic.js'

function setupChromium() {
    let currentLocationHref = window.location.href
    // Learn more about this hack from https://stackoverflow.com/a/52809105/1986338
    window.history.pushState = new $NoXRay.Proxy(history.pushState, {
        apply(target, thisArg, params: any) {
            const val = $.Reflect.apply(target, thisArg, params)
            $NoXRay.dispatchEvent(window, new $NoXRay.Event('locationchange'))
            if (currentLocationHref !== window.location.href) {
                currentLocationHref = window.location.href
                $NoXRay.dispatchEvent(window, new $NoXRay.Event('locationchange'))
            }
            return val
        },
    })
    window.history.replaceState = new $NoXRay.Proxy(history.replaceState, {
        apply(target, thisArg, params: any) {
            const val = $.Reflect.apply(target, thisArg, params)
            $NoXRay.dispatchEvent(window, new $NoXRay.Event('replacestate'))
            if (currentLocationHref !== window.location.href) {
                currentLocationHref = window.location.href
                $NoXRay.dispatchEvent(window, new $NoXRay.Event('replacestate'))
            }
            return val
        },
    })

    window.addEventListener('popstate', () => {
        if (currentLocationHref === window.location.href) return
        currentLocationHref = window.location.href
        $NoXRay.dispatchEvent(window, new $NoXRay.Event('locationchange'))
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
        $NoXRay.dispatchEvent(window, new $NoXRay.Event('locationchange'))
    }
}

;(() => {
    const isFF = navigator.userAgent.toLowerCase().includes('firefox')
    if (isFF) setupGecko()
    setupChromium()
})()
