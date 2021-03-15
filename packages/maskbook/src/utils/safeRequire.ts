import { isEnvironment, Environment, assertNotEnvironment } from '@dimensiondev/holoflows-kit'

export function safeGetActiveUI() {
    assertNotEnvironment(Environment.ManifestBackground)
    return (require('../social-network-next') as typeof import('../social-network-next')).activatedSocialNetworkUI
}

export function safeOptionsPageWorker() {
    if (!isEnvironment(Environment.ManifestOptions)) return
    return require('../social-network-provider/options-page/index') as typeof import('../social-network-provider/options-page/index')
}
