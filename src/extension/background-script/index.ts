import 'webcrypto-liner/dist/webcrypto-liner.shim'
// ! This is not a debug statement
Object.assign(window, {
    elliptic: require('elliptic'),
})

import './BackgroundService' // ?
import './CryptoService' // ? Encrypt, decrypt, sign, verify
import './PeopleService' // ? Key management + Avatar management
