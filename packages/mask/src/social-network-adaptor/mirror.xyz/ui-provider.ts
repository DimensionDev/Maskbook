import type { SocialNetworkUI } from '../../social-network/index.js'
import { stateCreator } from '../../social-network/utils.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/index.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'

import { mirrorBase } from './base.js'
import { mirrorShared } from './shared.js'
const define: SocialNetworkUI.Definition = {
    ...mirrorBase,
    ...mirrorShared,
    automation: {},
    collecting: {},
    configuration: {},
    customization: {},
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, mirrorShared.networkIdentifier)
        return { profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(),
    },
}
export default define
