import { GetContext, ValueRef } from '@holoflows/kit/es'
import { ProfileIdentifier } from '../../database/type'
import type { SocialNetworkUIDefinition } from '../ui'
import { nopWithUnmount } from '../../utils/utils'
import type { Profile } from '../../database'
import { ProfileArrayComparer, GroupArrayComparer } from '../../utils/comparer'
import { ObservableWeakMap } from '../../utils/ObservableMapSet'
import { noop } from 'lodash-es'

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
    myIdentitiesRef: new ValueRef([], ProfileArrayComparer),
    groupsRef: new ValueRef([], GroupArrayComparer),
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    currentIdentity: new ValueRef<Profile | null>(null),
    init() {
        if (GetContext() === 'content') throw new Error('DO NOT use this in content script')
    },
    collectPeople() {},
    collectPosts() {},
    ignoreSetupAccount() {},
    injectCommentBox: nopWithUnmount,
    injectPostBox: noop,
    injectPostComments: nopWithUnmount,
    injectPostReplacer: nopWithUnmount,
    injectPostInspector: nopWithUnmount,
    injectPageInspector: nopWithUnmount,
    resolveLastRecognizedIdentity: noop,
    posts: new ObservableWeakMap(),
    friendsRef: new ValueRef([], ProfileArrayComparer),
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
    taskPasteIntoPostBox() {},
    taskOpenComposeBox() {},
    taskUploadToPostBox() {},
    version: 1,
    gunNetworkHint: 'invalid-',
    taskStartSetupGuide() {},
    taskGotoProfilePage() {},
    taskGotoNewsFeedPage() {},
    getHomePage() {
        return ''
    },
}
