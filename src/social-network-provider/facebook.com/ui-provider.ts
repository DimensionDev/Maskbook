import { defineSocialNetworkUI } from '../../social-network/ui'
import { ValueRef } from '@holoflows/kit/es'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'
import { sharedProvider } from './shared-provider'
import { PersonIdentifier } from '../../database/type'
import { injectPostBoxFacebook } from './UI/injectPostBox'
import { collectPeopleFacebook } from './UI/collectPeople'
import { pasteIntoPostBoxFacebook } from './tasks/pasteIntoPostBox'
import { getPostContentFacebook } from './tasks/getPostContent'
import { resolveLastRecognizedIdentityFacebook } from './UI/resolveLastRecognizedIdentity'
import { getProfileFacebook } from './tasks/getProfile'
import { pasteIntoBioFacebook } from './tasks/pasteIntoBio'
import { shouldDisplayWelcomeDefault } from '../../social-network/defaults/shouldDisplayWelcome'
import { injectWelcomeBannerFacebook } from './UI/injectWelcomeBanner'
import { injectPostCommentsDefault } from '../../social-network/defaults/injectComments'
import { injectCommentBoxDefault } from '../../social-network/defaults/injectCommentBox'
import { selectElementContents, dispatchCustomEvents, sleep } from '../../utils/utils'
import { collectPostsFacebook } from './UI/collectPosts'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { setStorage } from '../../utils/browser.storage'

defineSocialNetworkUI({
    ...sharedProvider,
    init(env, pref) {
        sharedProvider.init(env, pref)
        InitFriendsValueRef(this, 'facebook.com')
        InitMyIdentitiesValueRef(this, 'facebook.com')
    },
    shouldActivate() {
        return location.hostname.endsWith('facebook.com')
    },
    friendlyName: 'Facebook',
    setupAccount() {
        setStorage('facebook.com', { forceDisplayWelcome: true })
        window.open('https://facebook.com/')
    },
    ignoreSetupAccount() {
        setStorage('facebook.com', { userIgnoredWelcome: true })
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault('facebook.com'),
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    injectWelcomeBanner: injectWelcomeBannerFacebook,
    injectPostComments: injectPostCommentsDefault(),
    injectCommentBox: injectCommentBoxDefault(async function onPasteToCommentBoxFacebook(encryptedComment, current) {
        const root = current.rootNode
        selectElementContents(root.querySelector('[contenteditable]')!)
        dispatchCustomEvents('paste', encryptedComment)
        await sleep(200)
        if (!root.innerText.includes(encryptedComment))
            prompt('Please paste it into the comment box!', encryptedComment)
    }),
    injectPostInspector: injectPostInspectorFacebook,
    collectPeople: collectPeopleFacebook,
    collectPosts: collectPostsFacebook,
    taskPasteIntoPostBox: pasteIntoPostBoxFacebook,
    taskPasteIntoBio: pasteIntoBioFacebook,
    taskGetPostContent: getPostContentFacebook,
    taskGetProfile: getProfileFacebook,
})
