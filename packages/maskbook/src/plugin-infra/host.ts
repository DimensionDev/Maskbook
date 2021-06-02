// All plugin manager need to call createPluginHost so let's register plugins implicitly.
import './register'

import type { Plugin } from '@dimensiondev/mask-plugin-infra'
import { Emitter } from '@servie/events'
import { ChainId, ProviderType } from '@dimensiondev/web3-shared'
import { safeUnreachable } from '@dimensiondev/maskbook-shared'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentSelectedWalletProviderSettings,
    currentWalletConnectChainIdSettings,
    currentCustomNetworkChainIdSettings,
} from '../plugins/Wallet/settings'
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
        const val = currentSelectedWalletProviderSettings.value
        switch (val) {
            case ProviderType.Maskbook:
                return currentMaskbookChainIdSettings.value
            case ProviderType.MetaMask:
                return currentMetaMaskChainIdSettings.value
            case ProviderType.WalletConnect:
                return currentWalletConnectChainIdSettings.value
            case ProviderType.CustomNetwork:
                return currentCustomNetworkChainIdSettings.value
            default:
                safeUnreachable(val)
                return ChainId.Mainnet
        }
    },
    events: new Emitter(),
}
function report() {
    ethStatusReporter.events.emit('change')
}
effect(() => currentMaskbookChainIdSettings.addListener(report))
effect(() => currentMetaMaskChainIdSettings.addListener(report))
effect(() => currentWalletConnectChainIdSettings.addListener(report))
