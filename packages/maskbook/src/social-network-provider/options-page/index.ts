import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { GetContext } from '@dimensiondev/holoflows-kit/es'

defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Options page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
