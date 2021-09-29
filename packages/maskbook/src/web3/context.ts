import { createWeb3Context, ProviderType, Web3ProviderType } from '@masknet/web3-shared'
import { WalletMessages, WalletRPC } from '../plugins/Wallet/messages'
import {
    currentAccountSettings,
    currentProviderSettings,
    currentChainIdSettings,
    currentMaskWalletChainIdSettings,
    currentMaskWalletAccountWalletSettings,
} from '../plugins/Wallet/settings'
import { MaskMessages } from '../utils'
import { createExternalProvider } from './helpers'
import Services from '../extension/service'

function createWeb3ContextInner(disablePopup = false, isMask = false): Web3ProviderType {
    const Web3Provider = createExternalProvider(
        () => {
            return isMask
                ? {
                      account: currentMaskWalletAccountWalletSettings.value,
                      chainId: currentMaskWalletChainIdSettings.value,
                      providerType: ProviderType.MaskWallet,
                  }
                : {
                      account: currentAccountSettings.value,
                      chainId: currentChainIdSettings.value,
                      providerType: currentProviderSettings.value,
                  }
        },
        () => {
            return {
                popupsWindow: !disablePopup,
            }
        },
    )
    return createWeb3Context(Web3Provider, {
        MaskMessages: MaskMessages,
        MaskServices: Services,
        PluginServices: {
            Wallet: WalletRPC,
        },
        PluginMessages: {
            Wallet: WalletMessages,
        },
    })
}

export const Web3Context = createWeb3ContextInner()
export const PopupWeb3Context = createWeb3ContextInner(true, true)
export const SwapWeb3Context = createWeb3ContextInner(false, true)
