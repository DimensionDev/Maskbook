import { isEnvironment, Environment, assertNotEnvironment } from '@dimensiondev/holoflows-kit'

export function safeGetActiveUI() {
    assertNotEnvironment(Environment.ManifestBackground)
    return (require('../social-network/ui') as typeof import('../social-network/ui')).getActivatedUI()
}

export function safeOptionsPageWorker() {
    if (!isEnvironment(Environment.ManifestOptions)) return
    return require('../social-network-provider/options-page/index') as typeof import('../social-network-provider/options-page/index')
}
