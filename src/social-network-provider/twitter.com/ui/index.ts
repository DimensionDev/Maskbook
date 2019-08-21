import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, sharedSettings } from '../index'
import { shouldDisplayWelcomeDefault } from '../../../social-network/defaults/shouldDisplayWelcome'
import { InitFriendsValueRef } from '../../../social-network/defaults/FriendsValueRef'
import { InitMyIdentitiesValueRef } from '../../../social-network/defaults/MyIdentitiesRef'
import { ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../../database/type'
import { injectPostBox, injectWelcomeBanner } from './inject'
import { collectPeople, collectPosts, resolveLastRecognizedIdentity } from './fetch'
import { nop } from '../../../utils/utils'
import { taskGetPostContent, taskGetProfile, taskPasteIntoBio, taskPasteIntoPostBox } from './task'
import { setStorage } from '../../../utils/browser.storage'

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
    friendlyName: 'Twitter',
    setupAccount() {
        setStorage(host, { forceDisplayWelcome: true }).then()
        window.open(sharedSettings.networkURL as string)
    },
    ignoreSetupAccount() {
        setStorage(host, { userIgnoredWelcome: true }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault(host),
    friendsRef: new ValueRef([]),
    myIdentitiesRef: new ValueRef([]),
    currentIdentity: new ValueRef(null),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    posts: new Map(),
    resolveLastRecognizedIdentity,
    injectPostBox,
    injectPostComments: nop,
    injectCommentBox: nop,
    injectPostInspector: nop,
    injectWelcomeBanner,
    collectPeople,
    collectPosts: () => collectPosts(def),
    taskPasteIntoPostBox,
    taskPasteIntoBio,
    taskGetPostContent,
    taskGetProfile,
})

export {}
