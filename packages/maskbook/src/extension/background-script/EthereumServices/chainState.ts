import { first } from 'lodash-es'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
    currentSelectedWalletAddressSettings,
    currentSelectedWalletProviderSettings,
    currentCustomNetworkChainIdSettings,
} from '../../../plugins/Wallet/settings'
import { WalletMessages } from '../../../plugins/Wallet/messages'
import { unreachable } from '@dimensiondev/maskbook-shared'
import { isSameAddress } from '../../../web3/helpers'
import { ChainId, ProviderType } from '../../../web3/types'
import { startEffects } from '../../../utils/side-effects'
import { Flags } from '../../../utils/flags'
import { getWalletsCached } from './wallet'
import { resetAllNonce } from './nonce'

const effect = startEffects(module.hot)

// revalidate ChainState if the chainId of current provider was changed
effect(() =>
    currentMaskbookChainIdSettings.addListener(() => {
        resetAllNonce()
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)
effect(() =>
    currentMetaMaskChainIdSettings.addListener(() => {
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)
effect(() =>
    currentWalletConnectChainIdSettings.addListener(() => {
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)

effect(() =>
    currentCustomNetworkChainIdSettings.addListener(() => {
        WalletMessages.events.chainIdUpdated.sendToAll(undefined)
    }),
)
//#endregion

/**
 * Get the chain id which is using by the given (or default) wallet
 * @param address
 */
export function getUnsafeChainId(address?: string) {
    const wallets = getWalletsCached()
    const address_ = currentSelectedWalletAddressSettings.value
    const provider = currentSelectedWalletProviderSettings.value
    const wallet =
        (address ? wallets.find((x) => isSameAddress(x.address, address)) : undefined) ??
        (address_ ? wallets.find((x) => isSameAddress(x.address, address_)) : undefined) ??
        first(wallets)
    if (!wallet) return currentMaskbookChainIdSettings.value
    if (provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    if (provider === ProviderType.CustomNetwork) return currentWalletConnectChainIdSettings.value
    unreachable(provider)
}

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 * @param address
 */
export async function getChainId(address?: string) {
    const unsafeChainId = await getUnsafeChainId(address)
    return unsafeChainId !== ChainId.Mainnet && !Flags.wallet_allow_test_chain ? ChainId.Mainnet : unsafeChainId
}
