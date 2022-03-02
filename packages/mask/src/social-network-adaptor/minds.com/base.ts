import { MINDS_ID } from '@masknet/shared'
import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const origins = ['https://www.minds.com/*', 'https://minds.com/*', 'https://cdn.minds.com/*']
export const mindsBase: SocialNetwork.Base = {
    networkIdentifier: MINDS_ID,
    name: 'minds',
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('minds.com')
    },
}

export function isMinds(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === MINDS_ID
}

export const mindsWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...mindsBase,
    gunNetworkHint: 'minds-',
}
