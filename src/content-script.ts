import './setup'
import { GetContext } from '@holoflows/kit/es'
if (GetContext() === 'content') {
    require('./extension/content-script/index')
}
