import type { SocialNetworkUI } from '@masknet/types'
import { stateCreator } from '../../social-network/utils.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/index.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'
import { IdentityProviderOpensea } from './collecting/Identity.js'
import { openseaBase } from './base.js'
import { openseaShared } from './shared.js'
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
