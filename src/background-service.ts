import './setup'
import { GetContext } from '@holoflows/kit/es'

if (GetContext() === 'background') {
    require('./extension/background-script')
}
