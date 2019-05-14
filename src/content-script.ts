import { GetContext } from '@holoflows/kit/es'
import { uiSetup } from './setup'
if (GetContext() === 'content') {
    uiSetup()
    require('./extension/content-script/index')
}
