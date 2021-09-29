import { ProfileIdentifier } from '../../database/type'
import { currentSelectedIdentity } from '../../settings/settings'
import { globalUIState, SocialNetworkUI, stateCreator } from '../../social-network'
import { injectPostCommentsDefault } from '../../social-network/defaults'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { unreachable } from '@dimensiondev/kit'
import { pasteImageToCompositionMinds } from './automation/AttachImageToComposition'
import { gotoNewsFeedPageMinds } from './automation/gotoNewsFeedPage'
import { gotoProfilePageMinds } from './automation/gotoProfilePage'
import { openComposeBoxMinds } from './automation/openComposeBox'
import { pasteTextToCompositionMinds } from './automation/pasteTextToComposition'
import { mindsBase } from './base'
import getSearchedKeywordAtMinds from './collecting/getSearchedKeyword'
import { IdentityProviderMinds } from './collecting/identity'
import { PostProviderMinds } from './collecting/post'
import { PaletteModeProviderMinds, useThemeMindsVariant } from './customization/custom'
import injectCommentBoxAtMinds from './injection/CommentBox'
import { injectPostBoxComposed } from './injection/inject'
import { injectPostInspectorAtMinds } from './injection/PostInspector'
import { injectPostReplacerAtMinds } from './injection/PostReplacer'
import { injectSearchResultBoxAtMinds } from './injection/SearchResult'
import { injectSetupPromptAtMinds } from './injection/SetupPrompt'
import { injectToolboxHintAtMinds } from './injection/ToolboxHint'
import { mindsShared } from './shared'
import { makeStyles } from '@masknet/theme'

const useInjectedDialogClassesOverwriteMinds = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
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
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
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
        borderBottom: `1px solid ${theme.palette.mode === 'dark' ? '#2f3336' : '#ccd6dd'}`,
        '& > h2': {
            display: 'inline-block',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        },
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            display: 'flex',
            justifyContent: 'space-between',
            maxWidth: 600,
            margin: '0 auto',
            padding: '7px 14px 6px 11px !important',
        },
    },
    dialogContent: {
        padding: 16,
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
            display: 'flex',
            flexDirection: 'column',
            maxWidth: 600,
            margin: '0 auto',
            padding: '7px 14px 6px !important',
        },
    },
    dialogActions: {
        padding: '6px 16px',
        [`@media (max-width: ${theme.breakpoints.values.sm}px)`]: {
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
}))

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
        componentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteMinds,
            },
        },
        useTheme: useThemeMindsVariant,
    },
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, mindsShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, mindsShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        toolBoxInNavBar: injectToolboxHintAtMinds,
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
        setupWizard: createTaskStartSetupGuideDefault('minds.com'),
        commentComposition: {
            compositionBox: injectPostCommentsDefault(),
            commentInspector: injectCommentBoxAtMinds(),
        },
        // NOT SUPPORTED YET
        userBadge: undefined,
    },
    configuration: {
        steganography: {
            password() {
                // ! Change this might be a breaking change !
                return new ProfileIdentifier(
                    'minds.com',
                    ProfileIdentifier.getUserName(IdentityProviderMinds.recognized.value.identifier) ||
                        ProfileIdentifier.getUserName(currentSelectedIdentity[mindsBase.networkIdentifier].value) ||
                        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                        unreachable('Cannot figure out password' as never),
                ).toText()
            },
        },
    },
}
export default mindsUI
