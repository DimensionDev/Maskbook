import { GetContext, ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../database/type'
import { SocialNetworkUIDefinition } from '../ui'
import { nop, nopWithUnmount } from '../../utils/utils'
import { Person, Group } from '../../database'

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
    myIdentitiesRef: new ValueRef([] as Person[]),
    groupsRef: new ValueRef([] as Group[]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef<Person | null>(null),
    init() {
        if (GetContext() === 'content') throw new Error('DO NOT use this in content script')
    },
    collectPeople() {},
    collectPosts() {},
    ignoreSetupAccount() {},
    injectCommentBox: nopWithUnmount,
    injectPostBox: nop,
    injectPostComments: nopWithUnmount,
    injectPostInspector: nopWithUnmount,
    injectWelcomeBanner: nopWithUnmount,
    resolveLastRecognizedIdentity: nop,
    async shouldDisplayWelcome() {
        return false
    },
    posts: new Map(),
    friendsRef: new ValueRef([] as Person[]),
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
    taskUploadToPostBox() {},
    version: 1,
    gunNetworkHint: 'invalid-',
}
