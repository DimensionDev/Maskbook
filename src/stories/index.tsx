import './Welcome'
import './Dashboard'
import './OptionsPage'
import './Injections'
import './Immersive-Setup'
import './RedPackets'
import './Settings'
import './shared'
import { definedSocialNetworkUIs, defineSocialNetworkUI, activateSocialNetworkUI } from '../social-network/ui'
import { demoPeople, demoGroup } from './demoPeopleOrGroups'
import { ValueRef } from '@holoflows/kit/es'
import { ProfileIdentifier } from '../database/type'
import { emptyDefinition } from '../social-network/defaults/emptyDefinition'
import { Profile } from '../database'

Object.assign(globalThis, {
    browser: {
        storage: {
            local: {
                get() {
                    return JSON.parse(localStorage.getItem('storybook') || '{}')
                },
                set(v: any) {
                    localStorage.setItem('storybook', JSON.stringify(v))
                },
            },
        },
    },
})

definedSocialNetworkUIs.clear()
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'Utopia',
    setupAccount: 'Setup your Utopia account in your dream',
    shouldActivate() {
        return true
    },
    myIdentitiesRef: new ValueRef(demoPeople),
    groupsRef: new ValueRef(demoGroup),
    lastRecognizedIdentity: new ValueRef({ identifier: new ProfileIdentifier('example.com', 'example-user-name') }),
    currentIdentity: new ValueRef<Profile | null>(null),
    friendsRef: new ValueRef(demoPeople),
})
defineSocialNetworkUI({ ...emptyDefinition, friendlyName: 'Neoparia Breakfast Club' })
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'telnet',
    setupAccount: 'Embrace the eternal September!',
    isDangerousNetwork: true as false,
})
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'MySpace',
    isDangerousNetwork: true as false,
})
activateSocialNetworkUI()
