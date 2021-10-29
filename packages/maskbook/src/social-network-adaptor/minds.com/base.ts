import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

export const MINDS_ID = 'minds.com'
const origins = ['https://www.minds.com/*', 'https://minds.com/*']
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
