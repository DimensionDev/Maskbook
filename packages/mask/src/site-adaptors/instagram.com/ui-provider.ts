import type { SiteAdaptorUI } from '@masknet/types'
import { stateCreator } from '../../site-adaptor-infra/index.js'
import { instagramShared } from './shared.js'
import { instagramBase } from './base.js'
import { IdentityProviderInstagram } from './collecting/identity-provider.js'
import { PostProviderInstagram } from './collecting/posts.js'
import { ThemeSettingsProviderInstagram } from './collecting/theme.js'
import {
    createTaskStartSetupGuideDefault,
    InitAutonomousStateProfiles,
    injectPageInspectorDefault,
} from '../../site-adaptor-infra/defaults/index.js'
import { pasteInstagram } from '@masknet/injected-script'
import { injectPostInspectorInstagram } from './injection/post-inspector.js'
import { CurrentVisitingIdentityProviderInstagram } from './collecting/identity.js'
import { injectProfileNFTAvatarInInstagram } from './injection/NFT/ProfileNFTAvatar.js'
import { injectNFTAvatarInInstagram } from './injection/NFT/NFTAvatarInInstagram.js'
import {
    injectOpenNFTAvatarEditProfileButton,
    openNFTAvatarSettingDialog,
} from './injection/NFT/NFTAvatarEditProfile.js'
import { injectUserNFTAvatarAtInstagram } from './injection/NFT/NFTAvatarInTimeline.js'
import { injectProfileTabAtInstagram } from './injection/ProfileTab.js'
import { injectProfileTabContentAtInstagram } from './injection/ProfileTabContent.js'
import { injectAvatar } from './injection/Avatar/index.js'
import { useThemeInstagramVariant } from './customization/custom.js'

const define: SiteAdaptorUI.Definition = {
    ...instagramShared,
    ...instagramBase,
    automation: {
        nativeCompositionDialog: {
            async attachImage(url, options) {
                pasteInstagram(new Uint8Array(await url.arrayBuffer()))
            },
        },
    },
    collecting: {
        identityProvider: IdentityProviderInstagram,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderInstagram,
        postsProvider: PostProviderInstagram,
        themeSettingsProvider: ThemeSettingsProviderInstagram,
    },
    configuration: {},
    customization: {
        useTheme: useThemeInstagramVariant,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, instagramBase.networkIdentifier)
        // No need to init cause this network is not going to support those features now.
        return { profiles }
    },
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(),
        postInspector: injectPostInspectorInstagram,
        profileAvatar: injectNFTAvatarInInstagram,
        enhancedProfileNFTAvatar: injectProfileNFTAvatarInInstagram,
        openNFTAvatar: injectOpenNFTAvatarEditProfileButton,
        userAvatar: injectUserNFTAvatarAtInstagram,
        pageInspector: injectPageInspectorDefault(),
        profileTab: injectProfileTabAtInstagram,
        profileTabContent: injectProfileTabContentAtInstagram,
        openNFTAvatarSettingDialog,
        /* newPostComposition: {
            start: newPostCompositionInstagram,
            supportedInputTypes: { text: true, image: true },
            supportedOutputTypes: { text: false, image: true },
        },*/
        avatar: injectAvatar,
    },
}
export default define
