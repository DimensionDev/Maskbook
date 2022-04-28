import { globalUIState, SocialNetworkUI, stateCreator } from '../../social-network'
import { twitterBase } from './base'
import getSearchedKeywordAtTwitter from './collecting/getSearchedKeyword'
import { twitterShared } from './shared'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { openComposeBoxTwitter } from './automation/openComposeBox'
import { pasteTextToCompositionTwitter } from './automation/pasteTextToComposition'
import { gotoNewsFeedPageTwitter } from './automation/gotoNewsFeedPage'
import { gotoProfilePageTwitter } from './automation/gotoProfilePage'
import { IdentityProviderTwitter, CurrentVisitingIdentityProviderTwitter } from './collecting/identity'
import { collectVerificationPost, PostProviderTwitter } from './collecting/post'
import { PaletteModeProviderTwitter, useThemeTwitterVariant } from './customization/custom'
import { injectToolboxHintAtTwitter } from './injection/ToolboxHint'
import { i18NOverwriteTwitter } from './customization/i18n'
import { injectSearchResultBoxAtTwitter } from './injection/SearchResultBox'
import { injectProfileSliderAtTwitter } from './injection/ProfileSlider'
import { injectProfileTabAtTwitter } from './injection/ProfileTab'
import { injectProfileTabContentAtTwitter } from './injection/ProfileTabContent'
import { injectPostReplacerAtTwitter } from './injection/PostReplacer'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector'
import { injectSetupPromptAtTwitter } from './injection/SetupPrompt'
import { injectPostBoxComposed } from './injection/inject'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide'
import { injectMaskUserBadgeAtTwitter } from './injection/MaskIcon'
import { pasteImageToCompositionDefault } from '../../social-network/defaults/automation/AttachImageToComposition'
import { injectPostInspectorAtTwitter } from './injection/PostInspector'
import { injectPostActionsAtTwitter } from './injection/PostActions'
import { NextIDPlatform, ProfileIdentifier } from '@masknet/shared-base'
import { unreachable } from '@dimensiondev/kit'
import { makeStyles } from '@masknet/theme'
import { injectNFTAvatarInTwitter } from './injection/NFT/NFTAvatarInTwitter'
import { injectOpenTipButtonOnProfile } from './injection/Tip/index'
import { injectProfileNFTAvatarInTwitter } from './injection/NFT/ProfileNFTAvatar'
import { injectUserNFTAvatarAtTwitter } from './injection/NFT/Avatar'
import { injectOpenNFTAvatarEditProfileButton, openNFTAvatarSettingDialog } from './injection/NFT/NFTAvatarEditProfile'
import { injectUserNFTAvatarAtTweet } from './injection/NFT/TweetNFTAvatar'
import { injectNFTAvatarClipInTwitter } from './injection/NFT/NFTAvatarClip'
import { TwitterRenderFragments } from './customization/render-fragments'

const useInjectedDialogClassesOverwriteTwitter = makeStyles()((theme) => {
    const smallQuery = `@media (max-width: ${theme.breakpoints.values.sm}px)`
    return {
        root: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            [smallQuery]: {
                display: 'block !important',
            },
        },
        container: {
            alignItems: 'center',
        },
        paper: {
            width: '600px !important',
            maxWidth: 'none',
            boxShadow: 'none',
            backgroundImage: 'none',
            [smallQuery]: {
                display: 'block !important',
                margin: 12,
            },
        },
        dialogTitle: {
            display: 'flex',
            alignItems: 'center',
            padding: '3px 16px',
            position: 'relative',
            background: theme.palette.background.modalTitle,
            borderBottom: 'none',
            '& > h2': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [smallQuery]: {
                display: 'flex',
                justifyContent: 'start',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px 11px !important',
            },
        },
        dialogContent: {
            padding: 16,
            [smallQuery]: {
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px',
            },
        },
        dialogActions: {
            padding: '6px 16px',
            [smallQuery]: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                maxWidth: 600,
                margin: '0 auto',
                padding: '7px 14px 6px !important',
            },
        },
        dialogBackdropRoot: {
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(110, 118, 125, 0.4)' : 'rgba(0, 0, 0, 0.4)',
        },
    }
})

const twitterUI: SocialNetworkUI.Definition = {
    ...twitterBase,
    ...twitterShared,
    automation: {
        maskCompositionDialog: {
            open: openComposeBoxTwitter,
        },
        nativeCommentBox: undefined,
        nativeCompositionDialog: {
            appendText: pasteTextToCompositionTwitter,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionDefault(() => false),
        },
        redirect: {
            newsFeed: gotoNewsFeedPageTwitter,
            profilePage: gotoProfilePageTwitter,
        },
    },
    collecting: {
        identityProvider: IdentityProviderTwitter,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderTwitter,
        postsProvider: PostProviderTwitter,
        getSearchedKeyword: getSearchedKeywordAtTwitter,
    },
    customization: {
        paletteMode: PaletteModeProviderTwitter,
        sharedComponentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteTwitter,
            },
        },
        componentOverwrite: {
            RenderFragments: TwitterRenderFragments,
        },
        useTheme: useThemeTwitterVariant,
        i18nOverwrite: i18NOverwriteTwitter,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, twitterShared.networkIdentifier)
        return { profiles }
    },
    injection: {
        toolbox: injectToolboxHintAtTwitter,
        searchResult: injectSearchResultBoxAtTwitter,
        profileTab: injectProfileTabAtTwitter,
        profileTabContent: injectProfileTabContentAtTwitter,
        profileSlider: injectProfileSliderAtTwitter,
        enhancedPostRenderer: injectPostReplacerAtTwitter,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtTwitter,
        postActions: injectPostActionsAtTwitter,
        setupPrompt: injectSetupPromptAtTwitter,
        newPostComposition: {
            start: injectPostBoxComposed,
            supportedInputTypes: {
                text: true,
                image: true,
            },
            supportedOutputTypes: {
                text: true,
                image: true,
            },
        },
        setupWizard: createTaskStartSetupGuideDefault(),
        userBadge: injectMaskUserBadgeAtTwitter,
        commentComposition: undefined,
        userAvatar: injectUserNFTAvatarAtTwitter,
        enhancedProfileNFTAvatar: injectProfileNFTAvatarInTwitter,
        profileAvatar: injectNFTAvatarInTwitter,
        profileTip: injectOpenTipButtonOnProfile,
        openNFTAvatar: injectOpenNFTAvatarEditProfileButton,
        postAndReplyNFTAvatar: injectUserNFTAvatarAtTweet,
        avatarClipNFT: injectNFTAvatarClipInTwitter,
        openNFTAvatarSettingDialog,
    },
    configuration: {
        nextIDConfig: {
            enable: true,
            platform: NextIDPlatform.Twitter,
            collectVerificationPost,
        },
        steganography: {
            password() {
                // ! Change this might be a breaking change !
                return new ProfileIdentifier(
                    'twitter.com',
                    ProfileIdentifier.getUserName(IdentityProviderTwitter.recognized.value.identifier) ||
                        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                        unreachable('Cannot figure out password' as never),
                ).toText()
            },
        },
    },
}

export default twitterUI
