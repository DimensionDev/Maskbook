import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'

defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Options page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
    },
    shouldActivate() {
        return isEnvironment(Environment.ManifestOptions)
    },
})
