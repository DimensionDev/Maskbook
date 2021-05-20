import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId, ProviderType } from '../types'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { Flags } from '../../utils/flags'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentSelectedWalletProviderSettings,
    currentWalletConnectChainIdSettings,
} from '../../plugins/Wallet/settings'

/**
 * Get the chain id which is using by the given (or default) wallet
 */
export function useUnsafeChainId() {
    const provider = useValueRef(currentSelectedWalletProviderSettings)
    const MaskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const MetaMaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const WalletConnectChainId = useValueRef(currentWalletConnectChainIdSettings)

    const wallet = useWallet()
    if (!wallet) return MaskbookChainId
    if (provider === ProviderType.Maskbook) return MaskbookChainId
    if (provider === ProviderType.MetaMask) return MetaMaskChainId
    if (provider === ProviderType.WalletConnect) return WalletConnectChainId
    return MaskbookChainId
}

/**
 * Get the chain id which is using by the given (or default) wallet
 * It will always yield Mainnet in production mode
 */
export function useChainId() {
    const unsafeChainId = useUnsafeChainId()
    return unsafeChainId !== ChainId.Mainnet && Flags.wallet_network_strict_mode_enabled
        ? ChainId.Mainnet
        : unsafeChainId
}

/**
 * Retruns true if chain id is available
 */
export function useChainIdValid() {
    const unsafeChainId = useUnsafeChainId()
    const selectedWallet = useWallet()
    return !Flags.wallet_network_strict_mode_enabled || unsafeChainId === ChainId.Mainnet || !selectedWallet
}
