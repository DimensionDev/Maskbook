import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import Services from '../../extension/service'
import { MessageCenter } from '../../utils/messages'
import { GetContext, ValueRef } from '@holoflows/kit/es'
import { Profile, Persona } from '../../database'
import { createDataWithIdentifierChangedListener } from '../../social-network/defaults/createDataWithIdentifierChangedListener'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}

const optionsPageUISelf = defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Options page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
        {
            const ref = optionsPageUISelf.myIdentitiesRef
            query(ref)
            MessageCenter.on('identityUpdated', () => query(ref))
            function query(ref: ValueRef<Profile[]>) {
                Services.Identity.queryMyProfiles().then(p => (ref.value = p))
            }
        }
        {
            const ref = optionsPageUISelf.friendsRef
            MessageCenter.on(
                'profilesChanged',
                createDataWithIdentifierChangedListener(ref, e => hasFingerprint(e.of)),
            )
            Services.Identity.queryProfiles().then(p => (ref.value = p.filter(hasFingerprint)))
        }
        {
            const ref = optionsPageUISelf.myPersonasRef
            query(ref)
            MessageCenter.on('personaUpdated', () => query(ref))
            function query(ref: ValueRef<Persona[]>) {
                Services.Identity.queryMyPersonas().then(p => (ref.value = p))
            }
        }
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
