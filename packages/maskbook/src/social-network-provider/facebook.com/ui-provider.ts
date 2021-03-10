import { defineSocialNetworkUI } from '../../social-network/ui'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'
import { sharedProvider } from './shared-provider'
import { injectPostBoxFacebook } from './UI/injectPostBox'
import { injectSetupPromptFacebook } from './UI/injectSetupPrompt'
import { collectPeopleFacebook } from './UI/collectPeople'
import { pasteIntoPostBoxFacebook } from './tasks/pasteIntoPostBox'
import { taskOpenComposeBoxFacebook } from './tasks/openComposeBox'
import { uploadToPostBoxFacebook } from './tasks/uploadToPostBox'
import { getPostContentFacebook } from './tasks/getPostContent'
import { resolveLastRecognizedIdentityFacebook } from './UI/resolveLastRecognizedIdentity'
import { getProfileFacebook } from './tasks/getProfile'
import { injectPostCommentsDefault } from '../../social-network/defaults/injectComments'
import { collectPostsFacebook } from './UI/collectPosts'
import { injectPostReplacerFacebook } from './UI/injectPostReplacer'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/injectCommentBox'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/taskStartSetupGuideDefault'
import { getProfilePageUrlAtFacebook } from './parse-username'
import { Flags } from '../../utils/flags'
import { injectPageInspectorDefault } from '../../social-network/defaults/injectPageInspector'
import { injectToolbarAtFacebook } from './UI/injectToolbar'
import { useThemeFacebook } from './UI/useTheme'
import { pasteToCommentBoxFacebook } from './UI/pasteToCommentBoxFacebook'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*']
export const facebookUISelf = defineSocialNetworkUI({
    ...sharedProvider,
    init() {
        sharedProvider.init()
        InitFriendsValueRef(facebookUISelf, 'facebook.com')
        InitMyIdentitiesValueRef(facebookUISelf, 'facebook.com')
    },
    // ssr complains 'ReferenceError: window is not defined'
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith('facebook.com')
    },
    hasPermission() {
        return browser.permissions.contains({ origins })
    },
    requestPermission() {
        // TODO: wait for webextension-shim to support <all_urls> in permission.
        if (Flags.no_web_extension_dynamic_permission_request) return Promise.resolve(true)
        return browser.permissions.request({ origins })
    },
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    injectToolbar: injectToolbarAtFacebook,
    injectSetupPrompt: injectSetupPromptFacebook,
    injectPostComments: injectPostCommentsDefault(),
    injectCommentBox: injectCommentBoxDefaultFactory(pasteToCommentBoxFacebook),
    injectPostReplacer: injectPostReplacerFacebook,
    injectPostInspector: injectPostInspectorFacebook,
    injectPageInspector: injectPageInspectorDefault(),
    collectPeople: collectPeopleFacebook,
    collectPosts: collectPostsFacebook,
    taskPasteIntoPostBox: pasteIntoPostBoxFacebook,
    taskOpenComposeBox: taskOpenComposeBoxFacebook,
    taskUploadToPostBox: uploadToPostBoxFacebook,
    taskGetPostContent: getPostContentFacebook,
    taskGetProfile: getProfileFacebook,
    taskStartSetupGuide: createTaskStartSetupGuideDefault('facebook.com'),
    taskGotoProfilePage(profile) {
        // there is no PWA way on Facebook desktop.
        // mobile not tested
        location.href = getProfilePageUrlAtFacebook(profile, 'open')
    },
    taskGotoNewsFeedPage() {
        const homeLink = document.querySelector<HTMLAnchorElement>(
            [
                '[data-click="bluebar_logo"] a[href]', // PC
                '#feed_jewel a[href]', // mobile
            ].join(','),
        )
        if (homeLink) homeLink.click()
        else if (location.pathname !== '/') location.pathname = '/'
    },
    useTheme: useThemeFacebook,
})
if (module.hot) {
    module.hot.accept('./tasks/pasteIntoPostBox.ts', () => {
        facebookUISelf.taskPasteIntoPostBox = pasteIntoPostBoxFacebook
    })
}
