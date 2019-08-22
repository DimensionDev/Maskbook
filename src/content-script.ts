const { GetContext } = require('@holoflows/kit/es') as typeof import('@holoflows/kit/es')
const { uiSetup } = require('./setup') as typeof import('./setup')
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
export default undefined
