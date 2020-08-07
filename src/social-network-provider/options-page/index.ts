import { defineSocialNetworkUI } from '../../social-network/ui'
import { emptyDefinition } from '../../social-network/defaults/emptyDefinition'
import { GetContext } from '@holoflows/kit/es'
import type { Profile } from '../../database'

function hasFingerprint(x: Profile) {
    return !!x.linkedPersona?.fingerprint
}

const optionsPageUISelf = defineSocialNetworkUI({
    ...emptyDefinition,
    internalName: 'Options page data source',
    async init(e, p) {
        emptyDefinition.init(e, p)
    },
    shouldActivate() {
        return GetContext() === 'options'
    },
})
