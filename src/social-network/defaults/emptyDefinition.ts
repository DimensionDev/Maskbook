import { GetContext, ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../database/type'
import { SocialNetworkUIDefinition } from '../ui'
import { nop } from '../../utils/utils'

/**
 * DO NOT use this in content script
 */
export const emptyDefinition: SocialNetworkUIDefinition = {
    acceptablePayload: ['latest'],
    friendlyName: '',
    setupAccount: '',
    shouldActivate() {
        return false
    },
    myIdentitiesRef: new ValueRef([]),
    groupsRef: new ValueRef([]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    init() {
        if (GetContext() === 'content') throw new Error('DO NOT use this in content script')
    },
    collectPeople() {},
    collectPosts() {},
    ignoreSetupAccount() {},
    injectCommentBox: nop,
    injectPostBox: nop,
    injectPostComments: nop,
    injectPostInspector: nop,
    injectWelcomeBanner: nop,
    resolveLastRecognizedIdentity: nop,
    async shouldDisplayWelcome() {
        return false
    },
    posts: new Map(),
    friendsRef: new ValueRef([]),
    isDangerousNetwork: false,
    isValidUsername() {
        return true
    },
    internalName: '',
    networkIdentifier: 'localhost',
    async taskGetPostContent() {
        return ''
    },
    async taskGetProfile() {
        return { bioContent: '' }
    },
    taskPasteIntoBio() {},
    taskPasteIntoPostBox() {},
    version: 1,
}
