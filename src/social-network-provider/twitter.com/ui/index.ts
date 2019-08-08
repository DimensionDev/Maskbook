import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../../database/type'
import { resolveLastRecognizedIdentity } from './resolveLastRecognizedIdentity'
import { injectPostBox, injectWelcomeBanner } from './inject'

defineSocialNetworkUI({
    ...sharedSettings,
    init() {
        InitFriendsValueRef(this, host)
        InitMyIdentitiesValueRef(this, host)
    },
    shouldActivate() {
        return location.hostname.endsWith(host)
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault(host),
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
    resolveLastRecognizedIdentity,
    injectPostBox,
    injectWelcomeBanner
})

export {}
