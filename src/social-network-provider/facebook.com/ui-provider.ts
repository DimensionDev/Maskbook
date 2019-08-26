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
import { collectPostsFacebook } from './UI/collectPosts'
import { injectPostInspectorFacebook } from './UI/injectPostInspector'
import { setStorage } from '../../utils/browser.storage'

const def = defineSocialNetworkUI({
    ...sharedProvider,
    init: (env, pref) => {
        sharedProvider.init(env, pref)
        InitFriendsValueRef(def, 'facebook.com')
        InitMyIdentitiesValueRef(def, 'facebook.com')
    },
    shouldActivate() {
        return location.hostname.endsWith('facebook.com')
    },
    friendlyName: 'Facebook',
    async setupAccount() {
        await browser.permissions.request({ origins: ['https://www.facebook.com/*', 'https://m.facebook.com/*'] })
        setStorage('facebook.com', { forceDisplayWelcome: true })
        window.open('https://facebook.com/')
    },
    ignoreSetupAccount() {
        setStorage('facebook.com', { userIgnoredWelcome: true, forceDisplayWelcome: false })
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    currentIdentity: new ValueRef(null),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    injectWelcomeBanner: injectWelcomeBannerFacebook,
    injectPostInspector: injectPostInspectorFacebook,
    collectPeople: collectPeopleFacebook,
    collectPosts: collectPostsFacebook,
    taskPasteIntoPostBox: pasteIntoPostBoxFacebook,
    taskPasteIntoBio: pasteIntoBioFacebook,
    taskGetPostContent: getPostContentFacebook,
    taskGetProfile: getProfileFacebook,
})
