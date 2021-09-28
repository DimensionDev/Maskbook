import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'
import { Flags } from '../../utils'

export const MINDS_ID = 'minds.com'
const origins = ['https://www.minds.com/*', 'https://minds.com/*']
export const mindsBase: SocialNetwork.Base = {
    networkIdentifier: MINDS_ID,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('minds.com')
    },
    notReadyForProduction: !Flags.v2_enabled,
}

export function isMinds(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === MINDS_ID
}

export const mindsWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...mindsBase,
    gunNetworkHint: 'minds-',
}
