/* eslint-disable tss-unused-classes/unused-classes */
import type { SocialNetworkUI } from '@masknet/types'
import { globalUIState, stateCreator } from '../../social-network/index.js'
import { twitterBase } from './base.js'
import getSearchedKeywordAtTwitter from './collecting/getSearchedKeyword.js'
import { twitterShared } from './shared.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'
import { openComposeBoxTwitter } from './automation/openComposeBox.js'
import { pasteTextToCompositionTwitter } from './automation/pasteTextToComposition.js'
import { pasteImageToCompositionTwitter } from './automation/pasteImageToComposition.js'
import { gotoNewsFeedPageTwitter } from './automation/gotoNewsFeedPage.js'
import { gotoProfilePageTwitter } from './automation/gotoProfilePage.js'
import { IdentityProviderTwitter, CurrentVisitingIdentityProviderTwitter } from './collecting/identity.js'
import { ThemeSettingsProviderTwitter } from './collecting/theme.js'
import { collectVerificationPost, PostProviderTwitter } from './collecting/post.js'
import { useThemeTwitterVariant } from './customization/custom.js'
import { injectToolboxHintAtTwitter } from './injection/ToolboxHint.js'
import { i18NOverwriteTwitter } from './customization/i18n.js'
import { injectSearchResultInspectorAtTwitter } from './injection/SearchResultInspector.js'
import { injectProfileTabAtTwitter } from './injection/ProfileTab.js'
import { injectProfileTabContentAtTwitter } from './injection/ProfileTabContent.js'
import { injectPostReplacerAtTwitter } from './injection/PostReplacer.js'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector.js'
import { injectSetupPromptAtTwitter } from './injection/SetupPrompt.js'
import { injectPostBoxComposed } from './injection/inject.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide.js'
import { injectMaskUserBadgeAtTwitter } from './injection/MaskIcon.js'
import { injectPostInspectorAtTwitter } from './injection/PostInspector.js'
import { injectPostActionsAtTwitter } from './injection/PostActions/index.js'
import { ProfileIdentifier } from '@masknet/shared-base'
import { EnhanceableSite, FontSize, NextIDPlatform, ThemeColor, ThemeMode } from '@masknet/web3-shared-base'
import { makeStyles } from '@masknet/theme'
import { injectNFTAvatarInTwitter } from './injection/NFT/NFTAvatarInTwitter.js'
import { injectTips } from './injection/Tips/index.js'
import { injectUserNFTAvatarAtTwitter } from './injection/NFT/Avatar.js'
import {
    injectOpenNFTAvatarEditProfileButton,
    openNFTAvatarSettingDialog,
} from './injection/NFT/NFTAvatarEditProfile.js'
import { injectUserNFTAvatarAtTweet } from './injection/NFT/TweetNFTAvatar.js'
import { injectNFTAvatarClipInTwitter } from './injection/NFT/NFTAvatarClip.js'
import { TwitterRenderFragments } from './customization/render-fragments.js'
import { injectProfileCover } from './injection/ProfileCover.js'
import { injectProfileCardHolder } from './injection/ProfileCard/index.js'
import { injectAvatar } from './injection/Avatar/index.js'
import { injectPluginSettingsDialogAtTwitter } from './injection/PluginSettingsDialog.js'

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
            minHeight: 400,
            maxHeight: 620,
            maxWidth: 'none',
            boxShadow: 'none',
            backgroundImage: 'none',
            [smallQuery]: {
                display: 'block !important',
                margin: 12,
            },
            '&::-webkit-scrollbar': {
                display: 'none',
            },
        },
        dialogTitle: {
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: 16,
            position: 'relative',
            background: theme.palette.maskColor.modalTitleBg,
            borderBottom: 'none',
            '& > p': {
                fontSize: 18,
                lineHeight: '22px',
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [smallQuery]: {
                display: 'flex',
                justifyContent: 'start',
                maxWidth: 600,
                minWidth: '100%',
                boxSizing: 'border-box',
                margin: '0 auto',
                padding: '7px 14px 6px 11px !important',
            },
        },
        dialogContent: {
            backgroundColor: theme.palette.maskColor.bottom,
            [smallQuery]: {
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 600,
                minWidth: '100%',
                margin: '0 auto',
                padding: '7px 14px 6px',
            },
        },
        dialogActions: {
            backgroundColor: theme.palette.maskColor.bottom,
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
            attachImage: pasteImageToCompositionTwitter(() => false),
        },
        redirect: {
            newsFeed: gotoNewsFeedPageTwitter,
            profilePage: gotoProfilePageTwitter,
        },
    },
    collecting: {
        identityProvider: IdentityProviderTwitter,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderTwitter,
        themeSettingsProvider: ThemeSettingsProviderTwitter,
        postsProvider: PostProviderTwitter,
        getSearchedKeyword: getSearchedKeywordAtTwitter,
    },
    customization: {
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
        searchResult: injectSearchResultInspectorAtTwitter,
        profileTab: injectProfileTabAtTwitter,
        profileCover: injectProfileCover,
        profileTabContent: injectProfileTabContentAtTwitter,
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
        profileAvatar: injectNFTAvatarInTwitter,
        openNFTAvatar: injectOpenNFTAvatarEditProfileButton,
        postAndReplyNFTAvatar: injectUserNFTAvatarAtTweet,
        avatarClipNFT: injectNFTAvatarClipInTwitter,
        openNFTAvatarSettingDialog,
        avatar: injectAvatar,
        tips: injectTips,
        profileCard: injectProfileCardHolder,
        PluginSettingsDialog: injectPluginSettingsDialogAtTwitter,
    },
    configuration: {
        themeSettings: {
            color: ThemeColor.Blue,
            size: FontSize.Normal,
            mode: ThemeMode.Light,
        },
        nextIDConfig: {
            enable: true,
            platform: NextIDPlatform.Twitter,
            collectVerificationPost,
        },
        steganography: {
            // ! Change this might be a breaking change !
            password() {
                const id =
                    IdentityProviderTwitter.recognized.value.identifier?.userId ||
                    globalUIState.profiles.value?.[0].identifier.userId
                if (!id) throw new Error('Cannot figure out password')
                return ProfileIdentifier.of(EnhanceableSite.Twitter, id).unwrap().toText()
            },
        },
    },
}

export default twitterUI
