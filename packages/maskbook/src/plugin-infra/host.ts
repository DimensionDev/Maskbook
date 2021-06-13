// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { Emitter } from '@servie/events'
import { currentChainIdSettings } from '../plugins/Wallet/settings'
import { startEffects } from '../utils/side-effects'

const effect = startEffects(import.meta.webpackHot)
export function createPluginHost(signal?: AbortSignal): Plugin.__Host.Host {
    return {
        eth: ethStatusReporter,
        signal,
        // TODO: need a place to store enabled/disabled status of a plugin id
        enabled: {
            isEnabled: (id) => true,
            events: new Emitter(),
        },
    }
}

const ethStatusReporter: Plugin.__Host.EthStatusReporter = {
    current() {
        return currentChainIdSettings.value
    },
    events: new Emitter(),
}
function report() {
    ethStatusReporter.events.emit('change')
}
effect(() => currentChainIdSettings.addListener(report))
