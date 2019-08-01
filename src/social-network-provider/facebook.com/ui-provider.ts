import { defineSocialNetworkUI } from '../../social-network/ui'
import { ValueRef } from '@holoflows/kit/es'
import { InitFriendsValueRef } from '../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../social-network/defaults/MyIdentitiesRef'
import { sharedProvider } from './shared-provider'
import { PersonIdentifier } from '../../database/type'
import resolveLastRecognizedIdentity from './UI/resolveLastRecognizedIdentity'
import { injectPostBoxFacebook } from './UI/injectPostBox'

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
    resolveLastRecognizedIdentity: resolveLastRecognizedIdentity,
    injectPostBox: injectPostBoxFacebook,
})
