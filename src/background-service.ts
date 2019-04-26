import { GetContext } from '@holoflows/kit/es'

Object.assign(window, { browser: require('webextension-polyfill') })
if (GetContext() === 'background') {
    require('./extension/background-script')
}

console.log = new Proxy(console.log, {
    apply(target, _, args) {
        if (args[0] === 'secp256k1') return
        return target(...args)
    },
})
