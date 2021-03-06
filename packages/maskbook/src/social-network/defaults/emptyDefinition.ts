import { Environment, ValueRef, assertNotEnvironment } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../../database/type'
import type { SocialNetworkUIDefinition } from '../ui'
import { nopWithUnmount } from '../../utils/utils'
import type { Profile } from '../../database'
import { ProfileArrayComparer, GroupArrayComparer } from '../../utils/comparer'
import { ObservableWeakMap } from '../../utils/ObservableMapSet'
import { noop } from 'lodash-es'
import { IdentifierMap } from '../../database/IdentifierMap'

/**
 * DO NOT use this in content script
 */
export const emptyDefinition: SocialNetworkUIDefinition = {
    hasPermission: async () => true,
    requestPermission: async () => true,
    shouldActivate() {
        return false
    },
    myIdentitiesRef: new ValueRef([], ProfileArrayComparer),
    lastRecognizedIdentity: new ValueRef({ identifier: ProfileIdentifier.unknown }),
    init() {
        assertNotEnvironment(Environment.ContentScript)
    },
    collectPeople() {},
    collectPosts() {},
    injectCommentBox: nopWithUnmount,
    injectPostBox: noop,
    injectToolbar: noop,
    injectSetupPrompt: noop,
    injectPostComments: nopWithUnmount,
    injectPostReplacer: nopWithUnmount,
    injectPostInspector: nopWithUnmount,
    injectPageInspector: nopWithUnmount,
    resolveLastRecognizedIdentity: noop,
    posts: new ObservableWeakMap(),
    friendsRef: new ValueRef(new IdentifierMap(new Map(), ProfileIdentifier)),
    isValidUsername() {
        return true
    },
    name: '',
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
    taskStartSetupGuide() {},
    taskGotoProfilePage() {},
    taskGotoNewsFeedPage() {},
    getHomePage() {
        return ''
    },
}
