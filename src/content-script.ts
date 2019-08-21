import { GetContext } from '@holoflows/kit/es'
import { uiSetup } from './setup'
if (process.env.NODE_ENV === 'development') {
    try {
        require('react-devtools')
    } catch {}
}
if (GetContext() === 'content') {
    uiSetup().then(() => {
        console.log('Maskbook content script loaded')
        require('./extension/content-script/index')
    })
}
