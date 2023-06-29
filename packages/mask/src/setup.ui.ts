import './initialization/fetch.js'
import './initialization/telemetry.js'
import '../shared-ui/locales_legacy/init.js'
import './initialization/storage.js'
import './initialization/telemetry-update.js'

import './social-network-adaptor/index.js'
import { activateSocialNetworkUI } from './social-network/define.js'
export const status = activateSocialNetworkUI()
