import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import Services from '../../extension/service'
import { MessageCenter } from '../../utils/messages'
import { ValueRef, GetContext } from '@holoflows/kit/es'
import { Person } from '../../database'

defineSocialNetworkUI({
    ...emptyDefinition,
    name: 'Options page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
        {
            const ref = this.myIdentitiesRef
            query(ref)
            MessageCenter.on('identityUpdated', () => query(ref))
            function query(ref: ValueRef<Person[]>) {
                Services.People.queryMyIdentity().then(p => (ref.value = p))
            }
        }
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
