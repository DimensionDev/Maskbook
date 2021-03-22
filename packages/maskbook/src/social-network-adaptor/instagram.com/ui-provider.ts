import { SocialNetworkUI, stateCreator } from '../../social-network'
import { instagramShared } from './shared'
import { instagramBase } from './base'
const origins = ['https://www.instagram.com/*', 'https://m.instagram.com/*', 'https://instagram.com/*']
const define: SocialNetworkUI.Definition = {
    ...instagramShared,
    ...instagramBase,
    automation: {},
    collecting: {},
    configuration: {},
    customization: {},
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        // No need to init cause this network is not going to support those features now.
        return { friends, profiles }
    },
    injection: {},
    permission: {
        request: () => browser.permissions.request({ origins }),
        has: () => browser.permissions.contains({ origins }),
    },
}
export default define
