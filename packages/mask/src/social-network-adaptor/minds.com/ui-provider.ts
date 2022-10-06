import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import type { SocialNetworkUI } from '@masknet/social-network-infra'
import { makeStyles } from '@masknet/theme'
import { globalUIState, stateCreator } from '../../social-network/index.js'
import { injectPostCommentsDefault } from '../../social-network/defaults/index.js'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector.js'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide.js'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles.js'
import { pasteImageToCompositionMinds } from './automation/AttachImageToComposition.js'
import { gotoNewsFeedPageMinds } from './automation/gotoNewsFeedPage.js'
import { gotoProfilePageMinds } from './automation/gotoProfilePage.js'
import { openComposeBoxMinds } from './automation/openComposeBox.js'
import { pasteTextToCompositionMinds } from './automation/pasteTextToComposition.js'
import { mindsBase } from './base.js'
import getSearchedKeywordAtMinds from './collecting/getSearchedKeyword.js'
import { IdentityProviderMinds } from './collecting/identity.js'
import { PostProviderMinds } from './collecting/post.js'
import { PaletteModeProviderMinds, useThemeMindsVariant } from './customization/custom.js'
import injectCommentBoxAtMinds from './injection/CommentBox.js'
import { injectPostBoxComposed } from './injection/inject.js'
import { injectPostInspectorAtMinds } from './injection/PostInspector.js'
import { injectPostReplacerAtMinds } from './injection/PostReplacer.js'
import { injectSearchResultBoxAtMinds } from './injection/SearchResultBox.js'
import { injectSetupPromptAtMinds } from './injection/SetupPrompt.js'
import { injectToolboxHintAtMinds } from './injection/ToolboxHint.js'
import { mindsShared } from './shared.js'
import { MindsRenderFragments } from './customization/render-fragments.js'
import { enableFbStyleTextPayloadReplace } from '../../../shared-ui/TypedMessageRender/transformer.js'
import { injectMindsProfileCover } from './injection/ProfileCover.js'
import { injectAvatar } from './injection/Avatar/index.js'

const useInjectedDialogClassesOverwriteMinds = makeStyles()((theme) => {
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
                '&': {
                    display: 'block !important',
                    borderRadius: '0 !important',
                },
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

const mindsUI: SocialNetworkUI.Definition = {
    ...mindsBase,
    ...mindsShared,
    automation: {
        maskCompositionDialog: {
            open: openComposeBoxMinds,
        },
        nativeCommentBox: undefined,
        nativeCompositionDialog: {
            appendText: pasteTextToCompositionMinds,
            // TODO: make a better way to detect
            attachImage: pasteImageToCompositionMinds(),
        },
        redirect: {
            newsFeed: gotoNewsFeedPageMinds,
            profilePage: gotoProfilePageMinds,
        },
    },
    collecting: {
        identityProvider: IdentityProviderMinds,
        postsProvider: PostProviderMinds,
        getSearchedKeyword: getSearchedKeywordAtMinds,
    },
    customization: {
        paletteMode: PaletteModeProviderMinds,
        sharedComponentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteMinds,
            },
        },
        componentOverwrite: {
            RenderFragments: MindsRenderFragments,
        },
        useTheme: useThemeMindsVariant,
    },
    init(signal) {
        const profiles = stateCreator.profiles()
        InitAutonomousStateProfiles(signal, profiles, mindsShared.networkIdentifier)
        enableFbStyleTextPayloadReplace()
        return { profiles }
    },
    injection: {
        toolbox: injectToolboxHintAtMinds,
        profileCover: injectMindsProfileCover,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtMinds,
        enhancedPostRenderer: injectPostReplacerAtMinds,
        setupPrompt: injectSetupPromptAtMinds,
        searchResult: injectSearchResultBoxAtMinds,
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
        commentComposition: {
            compositionBox: injectPostCommentsDefault(),
            commentInspector: injectCommentBoxAtMinds(),
        },
        // NOT SUPPORTED YET
        userBadge: undefined,
        avatar: injectAvatar,
    },
    configuration: {
        steganography: {
            // ! Change this might be a breaking change !
            password() {
                const id =
                    IdentityProviderMinds.recognized.value.identifier?.userId ||
                    globalUIState.profiles.value?.[0].identifier.userId
                if (!id) throw new Error('Cannot figure out password')
                return ProfileIdentifier.of(EnhanceableSite.Minds, id).unwrap().toText()
            },
        },
    },
}
export default mindsUI
