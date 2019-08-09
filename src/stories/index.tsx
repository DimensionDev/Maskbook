import './Welcome'
import './OptionsPage'
import './Injections'
import './shared'
import { definedSocialNetworkUIs, defineSocialNetworkUI, activateSocialNetworkUI } from '../social-network/ui'
import { demoPeople } from './demoPeople'
import { ValueRef } from '@holoflows/kit/es'
import { PersonIdentifier } from '../database/type'
import { emptyDefinition } from '../social-network/defaults/emptyDefinition'

definedSocialNetworkUIs.clear()
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'Utopia',
    setupAccount: 'Setup your Utopia account in your dream',
    shouldActivate() {
        return true
    },
    myIdentitiesRef: new ValueRef(demoPeople),
    lastRecognizedIdentity: new ValueRef({ identifier: PersonIdentifier.unknown }),
    currentIdentity: new ValueRef(null),
    friendsRef: new ValueRef(demoPeople),
})
defineSocialNetworkUI({ ...emptyDefinition, friendlyName: 'Neoparia Breakfast Club' })
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'telnet',
    setupAccount: 'Embrace the eternal September!',
    isDangerousNetwork: true as any,
})
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'MySpace',
    isDangerousNetwork: true as any,
})
activateSocialNetworkUI()
