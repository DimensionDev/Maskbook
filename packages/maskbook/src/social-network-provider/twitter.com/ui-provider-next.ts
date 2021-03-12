import { stateCreator, SocialNetworkUI } from '../../social-network-next'
import { twitterBase } from './base'
import { twitterShared } from './shared'
import { InitAutonomousStateFriends } from '../../social-network-next/defaults/InitAutonomousStateFriends'
import { InitAutonomousStateProfiles } from '../../social-network-next/defaults/InitAutonomousStateProfiles'
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
import { injectPageInspectorDefault } from '../../social-network/defaults/injectPageInspector'
import { injectSetupPromptAtTwitter } from './injection/SetupPrompt'
import { injectPostBoxComposed } from './injection/inject'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/taskStartSetupGuideDefault'
import { injectMaskUserBadgeAtTwitter } from './injection/MaskbookIcon'
import { pasteImageToCompositionDefault } from '../../social-network-next/defaults/pasteImageToComposition'

const origins = ['https://www.twitter.com/*', 'https://m.twitter.com/*']
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
            appendText(content, opts) {
                pasteTextToCompositionTwitter(content, { autoPasteFailedRecover: !!opts?.recover })
            },
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
        enhancedPostRenderer: (s, c) => injectPostReplacerAtTwitter(c, s),
        pageInspector: injectPageInspectorDefault(),
        postInspector: (s, c) => injectPostReplacerAtTwitter(c, s),
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
        startSetupWizard: createTaskStartSetupGuideDefault('twitter.com'),
        userBadge: injectMaskUserBadgeAtTwitter,
        commentComposition: undefined,
    },
}
export default twitterUI
