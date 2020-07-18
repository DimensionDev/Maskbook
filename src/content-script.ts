import './extension/injected-script/addEventListener'
import './setup.ui'
import { GetContext } from '@holoflows/kit/es'
if (GetContext() === 'content') {
    console.log('Maskbook content script loaded')
    import('./extension/content-script/index')
}
export default undefined
