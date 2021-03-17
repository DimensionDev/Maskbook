import { stateCreator, SocialNetworkUI } from '../../social-network'
import { twitterBase } from './base'
import { twitterShared } from './shared'
import { InitAutonomousStateFriends } from '../../social-network/defaults/state/InitFriends'
import { InitAutonomousStateProfiles } from '../../social-network/defaults/state/InitProfiles'
import { openComposeBoxTwitter } from './automation/openComposeBox'
import { pasteTextToCompositionTwitter } from './automation/pasteTextToComposition'
import { gotoNewsFeedPageTwitter } from './automation/gotoNewsFeedPage'
import { gotoProfilePageTwitter } from './automation/gotoProfilePage'
import { getPostContentTwitter } from './collecting/getPostContent'
import { getProfileTwitter } from './collecting/getProfile'
import { IdentityProviderTwitter } from './collecting/identity'
import { PostProviderTwitter } from './collecting/post'
import { profilesCollectorTwitter } from './collecting/profiles'
import {
    PaletteModeProviderTwitter,
    useInjectedDialogClassesOverwriteTwitter,
    useThemeTwitterVariant,
} from './customization/custom'
import { i18NOverwriteTwitter } from './customization/i18n'
import { injectToolbarAtTwitter } from './injection/Toolbar'
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

const origins = ['https://www.twitter.com/*', 'https://m.twitter.com/*', 'https://twitter.com/*']
const twitterUI: SocialNetworkUI.Definition = {
    ...twitterBase,
    ...twitterShared,
    permission: {
        has() {
            return browser.permissions.contains({ origins })
        },
        request() {
            return browser.permissions.request({ origins })
        },
    },
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
        getPostContent: getPostContentTwitter,
        getProfile: getProfileTwitter,
        identityProvider: IdentityProviderTwitter,
        postsProvider: PostProviderTwitter,
        profilesCollector: profilesCollectorTwitter,
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
        toolbar: injectToolbarAtTwitter,
        searchResult: injectSearchResultBoxAtTwitter,
        enhancedPostRenderer: injectPostReplacerAtTwitter,
        pageInspector: injectPageInspectorDefault(),
        postInspector: injectPostInspectorAtTwitter,
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
        setupWizard: createTaskStartSetupGuideDefault('twitter.com'),
        userBadge: injectMaskUserBadgeAtTwitter,
        commentComposition: undefined,
    },
    configuration: {
        steganography: {
            password() {
                // ! Change this might be a breaking change !
                return currentSelectedIdentity[twitterBase.networkIdentifier].value
            },
        },
    },
}
export default twitterUI
