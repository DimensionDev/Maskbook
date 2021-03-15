import { isEnvironment, Environment, assertNotEnvironment } from '@dimensiondev/holoflows-kit'

export function safeGetActiveUI() {
    assertNotEnvironment(Environment.ManifestBackground)
    return (require('../social-network') as typeof import('../social-network')).activatedSocialNetworkUI
}

export function safeOptionsPageWorker() {
    if (!isEnvironment(Environment.ManifestOptions)) return
    return require('../social-network-adaptor/options-page/index') as typeof import('../social-network-adaptor/options-page/index')
}
