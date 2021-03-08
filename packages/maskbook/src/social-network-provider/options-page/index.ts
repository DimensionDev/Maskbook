import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { isEnvironment, Environment } from '@dimensiondev/holoflows-kit'

defineSocialNetworkUI({
    ...emptyDefinition,
    name: 'Options page data source',
    init() {
        emptyDefinition.init()
    },
    shouldActivate() {
        return isEnvironment(Environment.ManifestOptions)
    },
})
