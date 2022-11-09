// This file should not import any file!!
/// <reference types="@masknet/global-types/web-extension" />

// If the current page is "", navigate to "#/personas", therefore we can avoid a Router skip when hydrating.
if (location.hash === '') location.assign('#/personas')

declare const trustedTypes: any
let trustedHTML: (x: string) => string
{
    if (typeof trustedTypes === 'object') {
        const policy = trustedTypes.createPolicy('ssr', {
            createHTML: (x: string) => String(x),
        })
        trustedHTML = (x) => policy.createHTML(x)
    } else {
        trustedHTML = (x) => x
    }
}

if (location.hash === '#/personas') {
    console.time('[SSR] Request')
    browser.runtime.sendMessage({ type: 'popups-ssr' }).then(({ html, css }) => {
        // React go first, but is that possible?
        if (document.querySelector('#root')) return

        // Push SSR code
        document.head.insertAdjacentHTML('beforeend', trustedHTML(css))
        document.body.innerHTML = trustedHTML('<div id="root">' + html + '</div>')
        console.timeEnd('[SSR] Request')

        console.time('[SSR] Hydrate')
    })
    import(/* webpackPreload: true */ './normal-client.js')
} else {
    import(/* webpackPreload: true */ './normal-client.js')
}

// this function is never called, but it will hint webpack to preload modules we need
function prefetch() {
    // Pages
    import(/* webpackPreload: true */ './pages/Personas/index.js')
    import(/* webpackPreload: true */ './pages/Personas/Home/index.js')
    import(/* webpackPreload: true */ './pages/Wallet/index.js')
}

// To make prefetch not be tree-shake
if (''.toLowerCase() === 'hint') {
    prefetch()
}
export {}
