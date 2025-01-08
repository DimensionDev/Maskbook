/* eslint-disable tss-unused-classes/unused-classes */
import type { SiteAdaptorUI } from '@masknet/types'
import { makeStyles } from '@masknet/theme'
import { ProfileIdentifier, EnhanceableSite } from '@masknet/shared-base'
import { stateCreator } from '../../site-adaptor-infra/utils.js'
import { facebookBase } from './base.js'
import { facebookShared } from './shared.js'
import { taskOpenComposeBoxFacebook } from './automation/openComposeBox.js'
import { pasteTextToCompositionFacebook } from './automation/pasteTextToComposition.js'
import { CurrentVisitingIdentityProviderFacebook, IdentityProviderFacebook } from './collecting/identity.js'
import { InitAutonomousStateProfiles } from '../../site-adaptor-infra/defaults/state/InitProfiles.js'
import { injectCompositionFacebook } from './injection/Composition.js'
import { injectBannerAtFacebook } from './injection/Banner.js'
import { injectPostCommentsDefault } from '../../site-adaptor-infra/defaults/inject/Comments.js'
import { pasteToCommentBoxFacebook } from './automation/pasteToCommentBoxFacebook.js'
import { injectCommentBoxDefaultFactory } from '../../site-adaptor-infra/defaults/inject/CommentBox.js'
import { injectPostInspectorFacebook } from './injection/PostInspector.js'
import getSearchedKeywordAtFacebook from './collecting/getSearchedKeyword.js'
import { injectSearchResultInspectorAtFacebook } from './injection/SearchResultInspector.js'
import { PostProviderFacebook } from './collecting/posts.js'
import { ThemeSettingsProviderFacebook } from './collecting/theme.js'
import { pasteImageToCompositionDefault } from '../../site-adaptor-infra/defaults/automation/AttachImageToComposition.js'
import { injectPageInspectorDefault } from '../../site-adaptor-infra/defaults/inject/PageInspector.js'
import { createTaskStartSetupGuideDefault } from '../../site-adaptor-infra/defaults/inject/StartSetupGuide.js'
import { useThemeFacebookVariant } from './customization/custom.js'
import { activatedSiteAdaptor_state } from '../../site-adaptor-infra/index.js'
import { injectToolboxHintAtFacebook as injectToolboxAtFacebook } from './injection/Toolbar.js'
import { injectProfileNFTAvatarInFacebook } from './injection/NFT/ProfileNFTAvatar.js'
import { injectNFTAvatarInFacebook } from './injection/NFT/NFTAvatarInFacebook.js'
import { injectUserNFTAvatarAtFacebook } from './injection/NFT/NFTAvatarInTimeline.js'
import {
    injectOpenNFTAvatarEditProfileButton,
    openNFTAvatarSettingDialog,
} from './injection/NFT/NFTAvatarEditProfile.js'
import { injectPostReplacerAtFacebook } from './injection/PostReplacer.js'
import { injectProfileTabContentAtFacebook } from './injection/ProfileContent.js'
import { FacebookRenderFragments } from './customization/render-fragments.js'
import { enableFbStyleTextPayloadReplace } from '../../../shared-ui/TypedMessageRender/transformer.js'
import { injectFacebookProfileCover } from './injection/ProfileCover.js'
import { injectAvatar } from './injection/Avatar/index.js'
import { injectProfileTabAtFacebook } from './injection/ProfileTab.js'

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

const facebookUI: SiteAdaptorUI.Definition = {
    ...facebookBase,
    ...facebookShared,
    automation: {
        maskCompositionDialog: { open: taskOpenComposeBoxFacebook },
        nativeCompositionDialog: {
            attachText: pasteTextToCompositionFacebook,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionDefault(() => false),
        },
        nativeCommentBox: {
            attachText: pasteToCommentBoxFacebook,
        },
    },
    collecting: {
        identityProvider: IdentityProviderFacebook,
        currentVisitingIdentityProvider: CurrentVisitingIdentityProviderFacebook,
        postsProvider: PostProviderFacebook,
        themeSettingsProvider: ThemeSettingsProviderFacebook,
        getSearchedKeyword: getSearchedKeywordAtFacebook,
    },
    customization: {
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
        searchResult: injectSearchResultInspectorAtFacebook,
        banner: injectBannerAtFacebook,
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
        enhancedProfileNFTAvatar: injectProfileNFTAvatarInFacebook,
        profileAvatar: injectNFTAvatarInFacebook,
        profileCover: injectFacebookProfileCover,
        openNFTAvatar: injectOpenNFTAvatarEditProfileButton,
        openNFTAvatarSettingDialog,
        postReplacer: injectPostReplacerAtFacebook,
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
            // ! Change this might be a breaking change !
            password() {
                const id =
                    IdentityProviderFacebook.recognized.value.identifier?.userId ||
                    activatedSiteAdaptor_state!.profiles.value?.[0].identifier.userId
                if (!id) throw new Error('Cannot figure out password')
                return ProfileIdentifier.of(EnhanceableSite.Facebook, id)
                    .expect(`${id} should be a valid user id`)
                    .toText()
            },
        },
    },
}
export default facebookUI
