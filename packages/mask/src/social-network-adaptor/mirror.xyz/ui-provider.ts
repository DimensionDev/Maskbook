import type { SocialNetworkUI } from '../../social-network/index.js'
import { stateCreator } from '../../social-network/utils.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/index.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'

import { mirrorBase } from './base.js'
import { mirrorShared } from './shared.js'
import { CurrentVisitingIdentityProviderMirror, IdentityProviderMirror } from './collecting/identity.js'
import { PaletteModeProviderMirror } from './customization/custom.js'
import { injectTips } from './injection/Tips/index.js'

// TODO: access chrome permission
const define: SocialNetworkUI.Definition = {
    ...mirrorBase,
    ...mirrorShared,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderMirror,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderMirror,
    },
    configuration: {},
    customization: {
        paletteMode: PaletteModeProviderMirror,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, mirrorShared.networkIdentifier)
        return { profiles }
    },
    injection: {
        // Todo: should remove this?
        setupWizard: createTaskStartSetupGuideDefault(),
        tips: injectTips,
    },
}
export default define
