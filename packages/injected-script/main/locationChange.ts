import { apply, dispatchEvent, no_xray_Event, no_xray_Proxy } from './intrinsic'

function setupChromium() {
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
        apply(dispatchEvent, window, [new no_xray_Event('locationchange')])
    }
}

;(() => {
    const isFF = navigator.userAgent.toLowerCase().includes('firefox')
    if (isFF) setupGecko()
    setupChromium()
})()

export {}
