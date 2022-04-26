import type { SocialNetworkUI } from '../../social-network'
import { stateCreator } from '../../social-network/utils'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults'
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
    configuration: {},
    customization: {},
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, openseaShared.networkIdentifier)
        return { profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(),
    },
}
export default define
