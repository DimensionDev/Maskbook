/* eslint-disable tss-unused-classes/unused-classes */
import type { SocialNetworkUI } from '../../social-network/types.js'
import { stateCreator } from '../../social-network/utils.js'
import { facebookBase } from './base.js'
import { facebookShared } from './shared.js'
import { getProfilePageUrlAtFacebook } from './utils/parse-username.js'
import { taskOpenComposeBoxFacebook } from './automation/openComposeBox.js'
import { pasteTextToCompositionFacebook } from './automation/pasteTextToComposition.js'
import { CurrentVisitingIdentityProviderFacebook, IdentityProviderFacebook } from './collecting/identity.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'
import { injectCompositionFacebook } from './injection/Composition.js'
import { injectSetupPromptFacebook } from './injection/SetupPrompt.js'
import { injectPostCommentsDefault } from '../../social-network/defaults/inject/Comments.js'
import { pasteToCommentBoxFacebook } from './automation/pasteToCommentBoxFacebook.js'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/inject/CommentBox.js'
import { injectPostInspectorFacebook } from './injection/PostInspector.js'
import getSearchedKeywordAtFacebook from './collecting/getSearchedKeyword.js'
import { injectSearchResultBoxAtFacebook } from './injection/SearchResultBox.js'
import { PostProviderFacebook } from './collecting/posts.js'
import { pasteImageToCompositionDefault } from '../../social-network/defaults/automation/AttachImageToComposition.js'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide.js'
import { GrayscaleAlgorithm } from '@masknet/encryption'
import { PaletteModeProviderFacebook, useThemeFacebookVariant } from './customization/custom.js'
import { makeStyles } from '@masknet/theme'
import { ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'
import { globalUIState } from '../../social-network/index.js'
import { injectToolboxHintAtFacebook as injectToolboxAtFacebook } from './injection/Toolbar.js'
import { injectProfileNFTAvatarInFaceBook } from './injection/NFT/ProfileNFTAvatar.js'
import { injectNFTAvatarInFacebook } from './injection/NFT/NFTAvatarInFacebook.js'
import { injectUserNFTAvatarAtFacebook } from './injection/NFT/NFTAvatarInTimeline.js'
import {
    injectOpenNFTAvatarEditProfileButton,
    openNFTAvatarSettingDialog,
} from './injection/NFT/NFTAvatarEditProfile.js'
import { injectProfileTabAtFacebook } from './injection/ProfileTab.js'
import { injectPostReplacerAtFacebook } from './injection/PostReplacer.js'
import { injectProfileTabContentAtFacebook } from './injection/ProfileContent.js'
import { FacebookRenderFragments } from './customization/render-fragments.js'
import { enableFbStyleTextPayloadReplace } from '../../../shared-ui/TypedMessageRender/transformer.js'
import { injectFacebookProfileCover } from './injection/ProfileCover.js'
import { injectAvatar } from './injection/Avatar/index.js'

const useInjectedDialogClassesOverwriteFacebook = makeStyles()((theme) => {
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
                borderRadius: '0 !important',
            },
        },
        dialogTitle: {
            display: 'flex',
            alignItems: 'center',
            padding: '3px 16px',
            borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#2f3336' : '#eff3f4'}`,
            '& > h2': {
                display: 'inline-block',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            },
            [smallQuery]: {
                display: 'flex',
                justifyContent: 'space-between',
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
                padding: '7px 14px 6px !important',
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

const facebookUI: SocialNetworkUI.Definition = {
    ...facebookBase,
    ...facebookShared,
    automation: {
        redirect: {
            profilePage(profile) {
                // there is no PWA way on Facebook desktop.
                // mobile not tested
                location.assign(getProfilePageUrlAtFacebook(profile))
            },
            newsFeed() {
                const homeLink = document.querySelector<HTMLAnchorElement>(
                    [
                        '[data-click="bluebar_logo"] a[href]',
                        '#feed_jewel a[href]', // mobile
                    ].join(','),
                )
                if (homeLink) homeLink.click()
                else if (location.pathname !== '/') location.assign('/')
            },
        },
        maskCompositionDialog: { open: taskOpenComposeBoxFacebook },
        nativeCompositionDialog: {
            appendText: pasteTextToCompositionFacebook,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionDefault(() => false),
        },
        nativeCommentBox: {
            appendText: pasteToCommentBoxFacebook,
        },
    },
    collecting: {
        identityProvider: IdentityProviderFacebook,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderFacebook,
        postsProvider: PostProviderFacebook,
        getSearchedKeyword: getSearchedKeywordAtFacebook,
    },
    customization: {
        paletteMode: PaletteModeProviderFacebook,
        sharedComponentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteFacebook,
            },
        },
        componentOverwrite: {
            RenderFragments: FacebookRenderFragments,
        },
        useTheme: useThemeFacebookVariant,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, facebookShared.networkIdentifier)
        enableFbStyleTextPayloadReplace()
        return { profiles }
    },
    injection: {
        newPostComposition: {
            start: injectCompositionFacebook,
            supportedOutputTypes: {
                text: true,
                image: true,
            },
            supportedInputTypes: {
                text: true,
                image: true,
            },
        },
        userBadge: undefined,
        searchResult: injectSearchResultBoxAtFacebook,
        setupPrompt: injectSetupPromptFacebook,
        commentComposition: {
            compositionBox: injectPostCommentsDefault(),
            commentInspector: injectCommentBoxDefaultFactory(
                pasteToCommentBoxFacebook,
                undefined,
                undefined,
                (node) => {
                    setTimeout(() => {
                        node.after.style.flexBasis = '100%'
                        node.current.parentElement!.style.flexWrap = 'wrap'
                    })
                },
            ),
        },
        userAvatar: injectUserNFTAvatarAtFacebook,
        enhancedProfileNFTAvatar: injectProfileNFTAvatarInFaceBook,
        profileAvatar: injectNFTAvatarInFacebook,
        profileCover: injectFacebookProfileCover,
        openNFTAvatar: injectOpenNFTAvatarEditProfileButton,
        openNFTAvatarSettingDialog,
        enhancedPostRenderer: injectPostReplacerAtFacebook,
        postInspector: injectPostInspectorFacebook,
        pageInspector: injectPageInspectorDefault(),
        setupWizard: createTaskStartSetupGuideDefault(),
        toolbox: injectToolboxAtFacebook,
        profileTab: injectProfileTabAtFacebook,
        profileTabContent: injectProfileTabContentAtFacebook,
        avatar: injectAvatar,
    },
    configuration: {
        steganography: {
            // ! the color image cannot compression resistance in Facebook
            grayscaleAlgorithm: GrayscaleAlgorithm.LUMINANCE,
            // ! Change this might be a breaking change !
            password() {
                const id =
                    IdentityProviderFacebook.recognized.value.identifier?.userId ||
                    globalUIState.profiles.value?.[0].identifier.userId
                if (!id) throw new Error('Cannot figure out password')
                return ProfileIdentifier.of(EnhanceableSite.Facebook, id).unwrap().toText()
            },
        },
    },
}
export default facebookUI
