import './setup.ui'
import { GetContext } from '@holoflows/kit/es'
if (process.env.NODE_ENV === 'development') {
    try {
        require('react-devtools')
    } catch {}
}
if (GetContext() === 'content') {
    console.log('Maskbook content script loaded')
    require('./extension/content-script/index')
}
export default undefined
