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
import { dispatchCustomEvents, selectElementContents, sleep } from '../../utils/utils'
import { collectPostsFacebook } from './UI/collectPosts'
import { injectPostReplacerFacebook } from './UI/injectPostReplacer'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { setStorage } from '../../utils/browser.storage'
import { isMobileFacebook } from './isMobile'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/injectCommentBox'
import { InitGroupsValueRef } from '../../social-network/defaults/GroupsValueRef'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults/taskStartSetupGuideDefault'
import { getProfilePageUrlAtFacebook } from './parse-username'
import { Flags } from '../../utils/flags'
import { getMaskbookTheme } from '../../utils/theme'
import { isDarkTheme } from '../../utils/theme-tools'
import { useState } from 'react'
import { useInterval } from 'react-use'
import { MaskMessage } from '../../utils/messages'
import { injectPageInspectorDefault } from '../../social-network/defaults/injectPageInspector'
import { Appearance } from '../../settings/types'
import { injectToolbarAtFacebook } from './UI/injectToolbar'

const origins = ['https://www.facebook.com/*', 'https://m.facebook.com/*']
export const facebookUISelf = defineSocialNetworkUI({
    ...sharedProvider,
    init(env, pref) {
        sharedProvider.init(env, pref)
        InitFriendsValueRef(facebookUISelf, 'facebook.com')
        InitGroupsValueRef(facebookUISelf, 'facebook.com')
        InitMyIdentitiesValueRef(facebookUISelf, 'facebook.com')
    },
    // ssr complains 'ReferenceError: window is not defined'
    shouldActivate(location: Location | URL = globalThis.location) {
        return location.hostname.endsWith('facebook.com')
    },
    friendlyName: 'Facebook',
    hasPermission() {
        return browser.permissions.contains({ origins })
    },
    requestPermission() {
        // TODO: wait for webextension-shim to support <all_urls> in permission.
        if (Flags.no_web_extension_dynamic_permission_request) return Promise.resolve(true)
        return browser.permissions.request({ origins })
    },
    setupAccount() {
        facebookUISelf.requestPermission().then((granted) => {
            if (granted) {
                setStorage('facebook.com', { forceDisplayWelcome: true })
                location.href = 'https://facebook.com/'
            }
        })
    },
    ignoreSetupAccount() {
        setStorage('facebook.com', { userIgnoredWelcome: true, forceDisplayWelcome: false })
    },
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    injectToolbar: injectToolbarAtFacebook,
    injectSetupPrompt: injectSetupPromptFacebook,
    injectPostComments: injectPostCommentsDefault(),
    injectCommentBox: injectCommentBoxDefaultFactory(async function onPasteToCommentBoxFacebook(
        encryptedComment,
        current,
        realCurrent,
    ) {
        const fail = () => {
            MaskMessage.events.autoPasteFailed.sendToLocal({ text: encryptedComment })
        }
        if (isMobileFacebook) {
            const root = realCurrent || current.commentBoxSelector!.evaluate()[0]
            if (!root) return fail()
            const textarea = root.querySelector('textarea')
            if (!textarea) return fail()
            textarea.focus()
            dispatchCustomEvents(textarea, 'input', encryptedComment)
            textarea.dispatchEvent(new CustomEvent('input', { bubbles: true, cancelable: false, composed: true }))
            await sleep(200)
            if (!root.innerText.includes(encryptedComment)) return fail()
        } else {
            const root = realCurrent || current.rootNode
            if (!root) return fail()
            const input = root.querySelector('[contenteditable]')
            if (!input) return fail()
            selectElementContents(input)
            dispatchCustomEvents(input, 'paste', encryptedComment)
            await sleep(200)
            if (!root.innerText.includes(encryptedComment)) return fail()
        }
    }),
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
    taskStartSetupGuide: createTaskStartSetupGuideDefault(() => facebookUISelf),
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
    useTheme() {
        const [theme, setTheme] = useState(getTheme())
        const updateTheme = () => setTheme(getTheme())
        // TODO: it's buggy.
        useInterval(updateTheme, 2000)
        return theme
    },
})
function getTheme() {
    return getMaskbookTheme({ appearance: isDarkTheme() ? Appearance.dark : Appearance.light })
}
if (module.hot) {
    module.hot.accept('./tasks/pasteIntoPostBox.ts', () => {
        facebookUISelf.taskPasteIntoPostBox = pasteIntoPostBoxFacebook
    })
}
