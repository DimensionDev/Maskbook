import { globalUIState, SocialNetworkUI, stateCreator } from '../../social-network'
import { twitterBase } from './base'
import getSearchedKeywordAtTwitter from './collecting/getSearchedKeyword'
import { twitterShared } from './shared'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { openComposeBoxTwitter } from './automation/openComposeBox'
import { pasteTextToCompositionTwitter } from './automation/pasteTextToComposition'
import { gotoNewsFeedPageTwitter } from './automation/gotoNewsFeedPage'
import { gotoProfilePageTwitter } from './automation/gotoProfilePage'
import { IdentityProviderTwitter, CurrentVisitingIdentityProviderTwitter } from './collecting/identity'
import { PostProviderTwitter } from './collecting/post'
import { PaletteModeProviderTwitter, useThemeTwitterVariant } from './customization/custom'
import { injectToolboxHintAtTwitter } from './injection/ToolboxHint'
import { i18NOverwriteTwitter } from './customization/i18n'
import { injectSearchResultBoxAtTwitter } from './injection/SearchResult'
import { injectPostReplacerAtTwitter } from './injection/PostReplacer'
import { injectPageInspectorDefault } from '../../social-network/defaults/inject/PageInspector'
import { injectSetupPromptAtTwitter } from './injection/SetupPrompt'
import { injectPostBoxComposed } from './injection/inject'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/inject/StartSetupGuide'
import { injectMaskUserBadgeAtTwitter } from './injection/MaskbookIcon'
import { pasteImageToCompositionDefault } from '../../social-network/defaults/automation/AttachImageToComposition'
import { currentSelectedIdentity } from '../../settings/settings'
import { injectPostInspectorAtTwitter } from './injection/PostInspector'
import { ProfileIdentifier } from '../../database/type'
import { unreachable } from '@dimensiondev/kit'
import { injectEnhancedProfileTabAtTwitter } from './injection/EnhancedProfileTab'
import { injectEnhancedProfileAtTwitter } from './injection/EnhancedProfile'
import { makeStyles } from '@masknet/theme'

const useInjectedDialogClassesOverwriteTwitter = makeStyles()((theme) => ({
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
        componentOverwrite: {
            InjectedDialog: {
                classes: useInjectedDialogClassesOverwriteTwitter,
            },
        },
        useTheme: useThemeTwitterVariant,
        i18nOverwrite: i18NOverwriteTwitter,
    },
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, twitterShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, twitterShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        toolBoxInNavBar: injectToolboxHintAtTwitter,
        searchResult: injectSearchResultBoxAtTwitter,
        enhancedPostRenderer: injectPostReplacerAtTwitter,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtTwitter,
        setupPrompt: injectSetupPromptAtTwitter,
        enhancedProfile: injectEnhancedProfileAtTwitter,
        enhancedProfileTab: injectEnhancedProfileTabAtTwitter,
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
        setupWizard: createTaskStartSetupGuideDefault('twitter.com'),
        userBadge: injectMaskUserBadgeAtTwitter,
        commentComposition: undefined,
    },
    configuration: {
        steganography: {
            password() {
                // ! Change this might be a breaking change !
                return new ProfileIdentifier(
                    'twitter.com',
                    ProfileIdentifier.getUserName(IdentityProviderTwitter.recognized.value.identifier) ||
                        ProfileIdentifier.getUserName(currentSelectedIdentity[twitterBase.networkIdentifier].value) ||
                        ProfileIdentifier.getUserName(globalUIState.profiles.value[0].identifier) ||
                        unreachable('Cannot figure out password' as never),
                ).toText()
            },
        },
    },
}
export default twitterUI
