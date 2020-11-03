import './Welcome'
import './OptionsPage'
import './Injections'
import './SetupGuide'
import './Plugin-RedPackets'
import './Settings'
import './shared'
import './Plugin-Gitcoin'
import { definedSocialNetworkUIs, defineSocialNetworkUI, activateSocialNetworkUI } from '../social-network/ui'
import { demoPeople, demoGroup } from './demoPeopleOrGroups'
import { ValueRef } from '@dimensiondev/holoflows-kit/es'
import { ProfileIdentifier } from '../database/type'
import { emptyDefinition } from '../social-network/defaults/emptyDefinition'
import type { Profile } from '../database'

Object.assign(globalThis, {
    browser: {
        storage: {
            local: {
                get() {
                    return JSON.parse(localStorage.getItem('storybook') || '{}')
                },
                set(v: unknown) {
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
    isDangerousNetwork: true,
})
defineSocialNetworkUI({
    ...emptyDefinition,
    friendlyName: 'MySpace',
    isDangerousNetwork: true,
})
activateSocialNetworkUI()
