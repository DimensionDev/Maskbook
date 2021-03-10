import type { SocialNetworkUI } from '../../social-network-next/types'
import { stateCreator } from '../../social-network-next/utils'
import { facebookBase } from './base'
import { facebookShared } from './shared'
import { getProfilePageUrlAtFacebook } from './parse-username'
import { getPostContentFacebook } from './tasks/getPostContent'
import { getProfileFacebook } from './tasks/getProfile'
import { taskOpenComposeBoxFacebook } from './tasks/openComposeBox'
import { pasteIntoPostBoxFacebook } from './tasks/pasteIntoPostBox'
import { IdentityProviderFacebook } from './UI/resolveLastRecognizedIdentity'
import { InitAutonomousStateFriends } from '../../social-network-next/defaults/InitAutonomousStateFriends'
import { InitAutonomousStateProfiles } from '../../social-network-next/defaults/InitAutonomousStateProfiles'
import { injectPostBoxFacebook } from './UI/injectPostBox'
import { injectSetupPromptFacebook } from './UI/injectSetupPrompt'
import { injectPostCommentsDefault } from '../../social-network/defaults/injectComments'
import { pasteToCommentBoxFacebook } from './UI/pasteToCommentBoxFacebook'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/injectCommentBox'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { injectPageInspectorDefault } from '../../social-network/defaults/injectPageInspector'
import { profilesCollectorFacebook } from './UI/collectPeople'
import { PostProviderFacebook } from './UI/collectPosts'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/taskStartSetupGuideDefault'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*']
const facebookUI: SocialNetworkUI.Definition = {
    ...facebookBase,
    ...facebookShared,
    permission: {
        has() {
            return browser.permissions.contains({ origins })
        },
        request() {
            return browser.permissions.request({ origins })
        },
    },
    automation: {
        redirect: {
            profilePage(profile) {
                // there is no PWA way on Facebook desktop.
                // mobile not tested
                location.href = getProfilePageUrlAtFacebook(profile, 'open')
            },
            newsFeed() {
                const homeLink = document.querySelector<HTMLAnchorElement>(
                    [
                        '[data-click="bluebar_logo"] a[href]', // PC
                        '#feed_jewel a[href]', // mobile
                    ].join(','),
                )
                if (homeLink) homeLink.click()
                else if (location.pathname !== '/') location.pathname = '/'
            },
        },
        maskCompositionDialog: { open: taskOpenComposeBoxFacebook },
        nativeCompositionDialog: {
            appendText(text, recover) {
                pasteIntoPostBoxFacebook(text, { autoPasteFailedRecover: !!recover })
            },
            attachImage(img, recover) {
                // TODO: uploadToPostBoxFacebook
            },
        },
        nativeCommentBox: {
            appendText: pasteToCommentBoxFacebook,
        },
    },
    collecting: {
        fetchPostContent: getPostContentFacebook,
        fetchProfile: getProfileFacebook,
        profilesCollector: profilesCollectorFacebook,
        identityProvider: IdentityProviderFacebook,
        postsProvider: PostProviderFacebook,
    },
    customization: {},
    init(signal) {
        const friends = stateCreator.friends()
        const profiles = stateCreator.profiles()
        InitAutonomousStateFriends(signal, friends, facebookShared.networkIdentifier)
        InitAutonomousStateProfiles(signal, profiles, facebookShared.networkIdentifier)
        return { friends, profiles }
    },
    injection: {
        newPostComposition: {
            start: injectPostBoxFacebook,
            supportedOutputTypes: {
                text: true,
                image: true,
            },
        },
        // Not supported yet
        toolbar: undefined,
        enhancedPostRenderer: undefined,
        userBadge: undefined,
        searchResult: undefined,
        setupPrompt: injectSetupPromptFacebook,
        commentComposition: {
            compositionBox: (s, c) => injectPostCommentsDefault()(c, s),
            commentInspector: (s, c) => injectCommentBoxDefaultFactory(pasteToCommentBoxFacebook)(c, s),
        },
        postInspector: (s, c) => injectPostInspectorFacebook(c, s),
        pageInspector: injectPageInspectorDefault(),
        startSetupWizard(for_) {
            createTaskStartSetupGuideDefault(facebookBase.networkIdentifier)
        },
    },
}
export default facebookUI
