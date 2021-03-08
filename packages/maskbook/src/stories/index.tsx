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
import { ValueRef } from '@dimensiondev/holoflows-kit'
import { ProfileIdentifier } from '../database/type'
import { emptyDefinition } from '../social-network/defaults/emptyDefinition'
import type { Profile } from '../database'
import { IdentifierMap } from '../database/IdentifierMap'

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
    shouldActivate() {
        return true
    },
    myIdentitiesRef: new ValueRef(demoPeople),
    lastRecognizedIdentity: new ValueRef({ identifier: new ProfileIdentifier('example.com', 'example-user-name') }),
    friendsRef: new ValueRef(new IdentifierMap(new Map())),
})
defineSocialNetworkUI({ ...emptyDefinition })
activateSocialNetworkUI()
