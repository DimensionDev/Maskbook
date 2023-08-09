import type { SiteAdaptorUI } from '@masknet/types'
import { stateCreator } from '../../social-network/utils.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/index.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'
import { IdentityProviderOpensea } from './collecting/Identity.js'
import { CurrentVisitingIdentityProviderDefault } from '../browser-action/collecting/identity.js'
import { ThemeSettingsProviderDefault } from '../browser-action/collecting/theme.js'
import { openseaBase } from './base.js'
import { openseaShared } from './shared.js'

const define: SiteAdaptorUI.Definition = {
    ...openseaShared,
    ...openseaBase,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderOpensea,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderDefault,
        themeSettingsProvider: ThemeSettingsProviderDefault,
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
