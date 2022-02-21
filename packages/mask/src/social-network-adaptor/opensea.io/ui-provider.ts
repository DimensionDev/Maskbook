import type { SocialNetworkUI } from '../../social-network'
import { stateCreator } from '../../social-network/utils'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { IdentityProviderOpensea } from './collecting/Identity'
import { openseaBase } from './base'
import { openseaShared } from './shared'
const define: SocialNetworkUI.Definition = {
    ...openseaShared,
    ...openseaBase,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderOpensea,
    },
    configuration: {
        setupWizard: {
            disableSayHello: false,
        },
    },
    customization: {},
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, openseaShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, openseaShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(),
    },
}
export default define
