import 'webcrypto-liner/dist/webcrypto-liner.shim'
// ! This is not a debug statement
Object.assign(window, {
    elliptic: require('elliptic'),
})

import './BackgroundService' // ?
import './CryptoService' // ? Encrypt, decrypt, sign, verify
import './PeopleService' // ? Key management + Avatar management
import TabTasks from '../content-script/tasks' // ? Automated tab tasks
Object.assign(window, { tasks: TabTasks })

import '../../tests/1to1' // ! test
import '../../tests/1toN' // ! test
import '../../tests/sign&verify' // ! test
