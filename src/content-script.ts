import { GetContext } from '@holoflows/kit/es'
import { uiSetup } from './setup'
if (process.env.NODE_ENV === 'development') {
    require('react-devtools')
}
if (GetContext() === 'content') {
    uiSetup()
    require('./extension/content-script/index')
}
