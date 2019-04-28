export function backgroundSetup() {
    require('webcrypto-liner/dist/webcrypto-liner.shim')
    Object.assign(window, {
        browser: require('webextension-polyfill'),
        elliptic: require('elliptic'),
    })
    if (!('__reduceLog__' in window)) {
        const banList = ['secp256k1', 'not intended to share', 'DOMException']
        const trap = {
            apply(target: any, _: any, args: any[]) {
                const msg = args.join('')
                for (const word of banList) if (msg.indexOf(word) !== -1) return
                target(...args)
                console.debug(new Error().stack)
            },
        }
        console.log = new Proxy(console.log, trap)
        console.error = new Proxy(console.error, trap)
        Object.assign(window, { __reduceLog__: true })
    }
}
export function uiSetup() {
    Object.assign(window, {
        browser: require('webextension-polyfill'),
        React: require('react'),
        // See: https://material-ui.com/style/typography/#migration-to-typography-v2
        __MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__: true,
    })
}
