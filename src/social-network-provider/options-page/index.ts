import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import Services from '../../extension/service'
import { MessageCenter } from '../../utils/messages'
import { GetContext, ValueRef } from '@holoflows/kit/es'
import { Profile } from '../../database'
import { createDataWithIdentifierChangedListener } from '../../social-network/defaults/createDataWithIdentifierChangedListener'

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
                createDataWithIdentifierChangedListener(ref, () => true),
            )
            Services.Identity.queryProfiles().then(p => (ref.value = p))
        }
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
