Object.assign(window, { browser: require('webextension-polyfill') })
import { GetContext } from '@holoflows/kit/es'
if (GetContext() === 'content') {
    require('./extension/content-script/index')
}
