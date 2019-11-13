import { GetContext, ValueRef } from '@holoflows/kit/es'
import { ProfileIdentifier } from '../../database/type'
import { SocialNetworkUIDefinition } from '../ui'
import { nop, nopWithUnmount } from '../../utils/utils'
import { Profile, Group } from '../../database'
import { PersonArrayComparer, GroupArrayComparer } from '../../utils/comparer'

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
    myIdentitiesRef: new ValueRef([] as Profile[], PersonArrayComparer),
    groupsRef: new ValueRef([] as Group[], GroupArrayComparer),
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    currentIdentity: new ValueRef<Profile | null>(null),
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
    friendsRef: new ValueRef([] as Profile[], PersonArrayComparer),
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
