import './Welcome'
import './OptionsPage'
import './Injections'
import './shared'
import { definedSocialNetworkUIs, defineSocialNetworkUI, activateSocialNetworkUI } from '../social-network/ui'
import { demoPeople } from './demoPeople'
import { ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../database/type'

definedSocialNetworkUIs.clear()
const noop = () => () => {}
defineSocialNetworkUI({
    friendlyName: 'Utopia',
    setupAccount: 'Setup your Utopia account in your dream',
    shouldActivate() {
        return true
    },
    myIdentitiesRef: new ValueRef(demoPeople),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    init() {},
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
    friendsRef: new ValueRef(demoPeople),
} as any)
defineSocialNetworkUI({ friendlyName: 'Neoparia Breakfast Club', setupAccount() {} } as any)
defineSocialNetworkUI({
    friendlyName: 'telnet',
    setupAccount: 'Embrace the eternal September!',
    isDangerousNetwork: true,
} as any)
defineSocialNetworkUI({
    friendlyName: 'MySpace',
    setupAccount() {},
    isDangerousNetwork: true,
} as any)
activateSocialNetworkUI()
