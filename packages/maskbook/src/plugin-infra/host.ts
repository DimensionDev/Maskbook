// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { Emitter } from '@servie/events'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../plugins/Wallet/settings'
import { startEffects } from '../utils/side-effects'
import { getUnsafeChainId } from '../extension/background-script/EthereumService'

const effect = startEffects(module.hot)
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
    current: getUnsafeChainId,
    events: new Emitter(),
}
function report() {
    ethStatusReporter.events.emit('change')
}
effect(() => currentMaskbookChainIdSettings.addListener(report))
effect(() => currentMetaMaskChainIdSettings.addListener(report))
effect(() => currentWalletConnectChainIdSettings.addListener(report))
