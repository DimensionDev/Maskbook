import { ValueRef, GetContext } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../database/type'
import { SocialNetworkUI } from '../ui'

const noop = () => () => {}
/**
 * DO NOT use this in content script
 */
export const emptyDefinition: SocialNetworkUI = {
    acceptablePayload: ['latest'],
    friendlyName: '',
    setupAccount: '',
    shouldActivate() {
        return false
    },
    myIdentitiesRef: new ValueRef([]),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    init() {
        if (GetContext() === 'content') throw new Error('DO NOT use this in content script')
    },
    collectPeople() {},
    collectPosts() {},
    ignoreSetupAccount() {},
    injectCommentBox: noop,
    injectPostBox: noop,
    injectPostComments: noop,
    injectPostInspector: noop,
    injectWelcomeBanner: noop,
    resolveLastRecognizedIdentity: noop,
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
