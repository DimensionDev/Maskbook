import type { SocialNetworkUI } from '@masknet/types'
import { stateCreator } from '../../social-network/utils.js'
import { injectPageInspectorDefault } from '../../social-network/defaults/index.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'

import { mirrorBase } from './base.js'
import { mirrorShared } from './shared.js'
import { CurrentVisitingIdentityProviderMirror, IdentityProviderMirror } from './collecting/identity.js'
import { injectTips } from './injection/Tips/index.js'
import { useInjectedDialogClassesOverwriteMirror } from './customization/ui-overwrite.js'
import { injectPostActionsAtMirror } from './injection/PostActions/index.js'
import { PostProviderMirror } from './collecting/posts.js'
import { ThemeSettingsProviderMirror } from './collecting/theme.js'
import { useThemeMirrorVariant } from './customization/custom.js'

// TODO: access chrome permission
const define: SocialNetworkUI.Definition = {
    ...mirrorBase,
    ...mirrorShared,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderMirror,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderMirror,
        postsProvider: PostProviderMirror,
        themeSettingsProvider: ThemeSettingsProviderMirror,
    },
    configuration: {
        tipsConfig: {
            enableUserGuide: true,
        },
    },
    customization: {
        sharedComponentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteMirror,
            },
        },
        useTheme: useThemeMirrorVariant,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, mirrorShared.networkIdentifier)
        return { profiles }
    },
    injection: {
        pageInspector: injectPageInspectorDefault(),
        postActions: injectPostActionsAtMirror,
        tips: injectTips,
    },
}
export default define
