import { defineSocialNetworkUI } from '../../social-network/ui'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'
import { sharedProvider } from './shared-provider'
import { injectPostBoxFacebook } from './UI/injectPostBox'
import { collectPeopleFacebook } from './UI/collectPeople'
import { pasteIntoPostBoxFacebook } from './tasks/pasteIntoPostBox'
import { uploadToPostBoxFacebook } from './tasks/uploadToPostBox'
import { getPostContentFacebook } from './tasks/getPostContent'
import { resolveLastRecognizedIdentityFacebook } from './UI/resolveLastRecognizedIdentity'
import { getProfileFacebook } from './tasks/getProfile'
import { pasteIntoBioFacebook } from './tasks/pasteIntoBio'
import { shouldDisplayWelcomeDefault } from '../../social-network/defaults/shouldDisplayWelcome'
import { injectWelcomeBannerFacebook } from './UI/injectWelcomeBanner'
import { injectPostCommentsDefault } from '../../social-network/defaults/injectComments'
import { dispatchCustomEvents, selectElementContents, sleep } from '../../utils/utils'
import { collectPostsFacebook } from './UI/collectPosts'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { setStorage } from '../../utils/browser.storage'
import { isMobileFacebook } from './isMobile'
import { geti18nString } from '../../utils/i18n'
import { injectCommentBoxDefaultFactory } from '../../social-network/defaults/injectCommentBox'
import { injectOptionsPageLinkAtFacebook } from './UI/injectOptionsPageLink'
import { InitGroupsValueRef } from '../../social-network/defaults/GroupsValueRef'

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
    setupAccount() {
        browser.permissions
            .request({ origins: ['https://www.facebook.com/*', 'https://m.facebook.com/*'] })
            .then(granted => {
                if (granted) {
                    setStorage('facebook.com', { forceDisplayWelcome: true })
                    location.href = 'https://facebook.com/'
                }
            })
    },
    ignoreSetupAccount() {
        setStorage('facebook.com', { userIgnoredWelcome: true, forceDisplayWelcome: false })
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    injectWelcomeBanner: injectWelcomeBannerFacebook,
    injectPostComments: injectPostCommentsDefault(),
    injectOptionsPageLink: injectOptionsPageLinkAtFacebook,
    injectCommentBox: injectCommentBoxDefaultFactory(async function onPasteToCommentBoxFacebook(
        encryptedComment,
        current,
    ) {
        const fail = () => {
            prompt(geti18nString('comment_box__paste_failed'), encryptedComment)
        }
        if (isMobileFacebook) {
            const root = current.commentBoxSelector!.evaluate()
            if (!root) return fail()
            const textarea = root.querySelector('textarea')
            if (!textarea) return fail()
            textarea.focus()
            dispatchCustomEvents('input', encryptedComment)
            textarea.dispatchEvent(new CustomEvent('input', { bubbles: true, cancelable: false, composed: true }))
            await sleep(200)
            if (!root.innerText.includes(encryptedComment)) return fail()
        } else {
            const root = current.rootNode
            if (!root) return fail()
            const input = root.querySelector('[contenteditable]')
            if (!input) return fail()
            selectElementContents(input)
            dispatchCustomEvents('paste', encryptedComment)
            await sleep(200)
            if (!root.innerText.includes(encryptedComment)) return fail()
        }
    }),
    injectPostInspector: injectPostInspectorFacebook,
    collectPeople: collectPeopleFacebook,
    collectPosts: collectPostsFacebook,
    taskPasteIntoBio: pasteIntoBioFacebook,
    taskPasteIntoPostBox: pasteIntoPostBoxFacebook,
    taskUploadToPostBox: uploadToPostBoxFacebook,
    taskGetPostContent: getPostContentFacebook,
    taskGetProfile: getProfileFacebook,
})
