import { SocialNetworkUI, stateCreator } from '../../social-network'
import { instagramShared } from './shared'
import { instagramBase } from './base'
import { IdentityProviderInstagram } from './collecting/identity-provider'
import { PostProviderInstagram } from './collecting/posts'
import { createTaskStartSetupGuideDefault, InitAutonomousStateProfiles } from '../../social-network/defaults'
import { pasteInstagram } from '@masknet/injected-script'
import { injectPostInspectorInstagram } from './injection/post-inspector'
import { CurrentVisitingIdentityProviderInstagram } from './collecting/identity'
import { injectProfileNFTAvatarInInstagram } from './injection/NFT/ProfileNFTAvatar'
import { injectNFTAvatarInInstagram } from './injection/NFT/NFTAvatarInInstagram'
import { injectOpenNFTAvatarEditProfileButton, openNFTAvatarSettingDialog } from './injection/NFT/NFTAvatarEditProfile'
import { injectUserNFTAvatarAtInstagram } from './injection/NFT/NFTAvatarInTimeline'
import { injectProfileTabAtInstagram } from './injection/ProfileTab'
import { injectProfileTabContentAtInstagram } from './injection/ProfileTabContent'

const define: SocialNetworkUI.Definition = {
    ...instagramShared,
    ...instagramBase,
    automation: {
        nativeCompositionDialog: {
            attachImage(url, options) {
                if (url instanceof Blob) url = URL.createObjectURL(url)
                pasteInstagram(url)
            },
        },
    },
    collecting: {
        identityProvider: IdentityProviderInstagram,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderInstagram,
        postsProvider: PostProviderInstagram,
    },
    configuration: {},
    customization: {},
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
        profileTab: injectProfileTabAtInstagram,
        profileTabContent: injectProfileTabContentAtInstagram,
        openNFTAvatarSettingDialog,
        /* newPostComposition: {
            start: newPostCompositionInstagram,
            supportedInputTypes: { text: true, image: true },
            supportedOutputTypes: { text: false, image: true },
        },*/
    },
}
export default define
