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
function useUnsafeChainId() {
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

export { useChainId } from '@dimensiondev/web3-shared'

/**
 * Retruns true if chain id is available
 */
export function useChainIdValid() {
    const unsafeChainId = useUnsafeChainId()
    const selectedWallet = useWallet()
    return !Flags.wallet_network_strict_mode_enabled || unsafeChainId === ChainId.Mainnet || !selectedWallet
}
