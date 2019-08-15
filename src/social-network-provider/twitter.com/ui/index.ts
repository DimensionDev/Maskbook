import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../../database/type'
import { resolveLastRecognizedIdentity } from './resolveLastRecognizedIdentity'
import { injectPostBox, injectWelcomeBanner } from './inject'
import { collectPeople } from './fetch'
import { nop } from '../../../utils/utils'

// TODO: host -> def.host
const def = defineSocialNetworkUI({
    ...sharedSettings,
    init() {
        InitFriendsValueRef(def, host)
        InitMyIdentitiesValueRef(def, host)
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
    injectPostComments: nop,
    injectCommentBox: nop,
    injectPostInspector: nop,
    injectWelcomeBanner,
    collectPeople,
    collectPosts
})

export {}
