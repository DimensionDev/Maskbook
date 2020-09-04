import './setup.ui'
import { GetContext } from '@holoflows/kit/es'
if (GetContext() === 'content') {
    console.log('Maskbook content script loaded')
    require('./extension/content-script/index')
}
export default undefined
