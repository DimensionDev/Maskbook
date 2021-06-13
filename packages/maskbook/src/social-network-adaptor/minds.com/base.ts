import type { SocialNetwork, SocialNetworkWorker } from '../../social-network/types'

const id = 'minds.com'
const origins = ['https://www.minds.com/*', 'https://minds.com/*']
export const mindsBase: SocialNetwork.Base = {
    networkIdentifier: id,
    declarativePermissions: { origins },
    shouldActivate(location) {
        return location.hostname.endsWith('minds.com')
    },
    notReadyForProduction: true,
}

export function isMinds(ui: SocialNetwork.Base) {
    return ui.networkIdentifier === id
}

export const mindsWorkerBase: SocialNetworkWorker.WorkerBase & SocialNetwork.Base = {
    ...mindsBase,
    gunNetworkHint: 'minds-',
}
