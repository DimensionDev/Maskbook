// Start SNS adaptor
import '../shared-ui/locales_legacy/init.js'
import './setup.ui.0.js'
import './social-network-adaptor/index.js'
import { activateSocialNetworkUI } from './social-network/define.js'
export const status = activateSocialNetworkUI()
