import { GetContext } from '@holoflows/kit/es'
import './social-network-provider/facebook.com/worker-provider'
import './social-network-provider/twitter.com/worker'
if (GetContext() === 'options') {
    import('./social-network-provider/options-page/index')
}
