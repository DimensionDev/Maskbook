import { GetContext } from '@holoflows/kit/es'

Object.assign(window, { browser: require('webextension-polyfill') })
if (GetContext() === 'background') {
    require('./extension/background-script')
}

const old = console.log
console.log = (...args: any[]) => {
    if (args[0] === 'secp256k1') return // drop the annoying log
    return old(...args)
}
