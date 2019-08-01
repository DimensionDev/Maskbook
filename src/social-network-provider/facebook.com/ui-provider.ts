import { defineSocialNetworkUI } from '../../social-network/ui'
import { ValueRef } from '@holoflows/kit/es'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'
import { sharedProvider } from './shared-provider'
import { PersonIdentifier } from '../../database/type'
import { injectPostBoxFacebook } from './UI/injectPostBox'
import { collectPeopleFacebook } from './UI/collectPeople'
import { pasteIntoPostBoxFacebook } from './tasks/pasteIntoPostBox'
import { getPostContentFacebook } from './tasks/getPostContentFacebook'
import { resolveLastRecognizedIdentityFacebook } from './UI/resolveLastRecognizedIdentity'
import { getProfileFacebook } from './tasks/getProfile'

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
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentityFacebook,
    injectPostBox: injectPostBoxFacebook,
    collectPeople: collectPeopleFacebook,
    taskPasteIntoPostBox: pasteIntoPostBoxFacebook,
    taskGetPostContent: getPostContentFacebook,
    taskGetProfile: getProfileFacebook,
})
