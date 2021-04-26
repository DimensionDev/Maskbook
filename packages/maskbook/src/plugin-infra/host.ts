import type { EthStatusReporter, PluginHost } from '@dimensiondev/mask-plugin-infra'
import { Emitter } from '@servie/events'
import { currentSelectedWalletProviderSettings } from '../plugins/Wallet/settings'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../settings/settings'
import { startEffects } from '../utils/side-effects'
import { safeUnreachable } from '../utils/utils'
import { ChainId, ProviderType } from '../web3/types'

const effect = startEffects(module.hot)
export function createPluginHost(signal?: AbortSignal): PluginHost {
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

const ethStatusReporter: EthStatusReporter = {
    current() {
        const val = currentSelectedWalletProviderSettings.value
        switch (val) {
            case ProviderType.Maskbook:
                return currentMaskbookChainIdSettings.value
            case ProviderType.MetaMask:
                return currentMetaMaskChainIdSettings.value
            case ProviderType.WalletConnect:
                return currentWalletConnectChainIdSettings.value
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
