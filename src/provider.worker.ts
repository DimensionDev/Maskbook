import './social-network-provider/facebook.com/worker-provider'
import './social-network-provider/twitter.com/worker'
import { GetContext } from '@holoflows/kit/es'

GetContext() === 'options' &&
    (require('./social-network-provider/options-page/index') as typeof import('./social-network-provider/options-page/index'))
