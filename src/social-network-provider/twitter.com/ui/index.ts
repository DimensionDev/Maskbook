import { defineSocialNetworkUI } from '../../../social-network/ui'
import { host, hostMobileURL, hostURL, sharedSettings } from '../index'
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

const def = defineSocialNetworkUI({
    ...sharedSettings,
    init: (env, pref) => {
        sharedSettings.init(env, pref)
        InitFriendsValueRef(def, host)
        InitMyIdentitiesValueRef(def, host)
    },
    shouldActivate() {
        return location.hostname.endsWith(host)
    },
    friendlyName: 'Twitter',
    setupAccount: async () => {
        await browser.permissions.request({
            origins: [`${hostURL}/*`, `${hostMobileURL}/*`],
        })
        setStorage(host, { forceDisplayWelcome: true }).then()
        window.open(hostURL as string)
    },
    ignoreSetupAccount() {
        setStorage(host, { userIgnoredWelcome: true }).then()
    },
    shouldDisplayWelcome: shouldDisplayWelcomeDefault,
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
