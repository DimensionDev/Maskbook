import type { SocialNetworkUI } from '../../social-network'
import { createTaskStartSetupGuideDefault } from '../../social-network/defaults'
import { IdentityProviderOpensea } from './collecting/Identity'
import { openseaBase } from './base'
import { openseaShared } from './shared'
const define: SocialNetworkUI.Definition = {
    ...openseaShared,
    ...openseaBase,
    automation: {},
    collecting: {
        identityProvider: IdentityProviderOpensea,
    },
    configuration: {
        setupWizard: {
            disableSayHello: true,
        },
    },
    customization: {},
    injection: {
        setupWizard: createTaskStartSetupGuideDefault(),
    },
}
export default define
