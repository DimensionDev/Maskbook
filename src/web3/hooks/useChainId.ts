import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { ProviderType } from '../types'
import { ChainId } from '../types'
import { useDefaultWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the chain id which is using by current wallet
 */
export function useChainId() {
    const wallet = useDefaultWallet()
    const maskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const metamaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const walletconnectChainId = useValueRef(currentWalletConnectChainIdSettings)
    if (wallet?.provider === ProviderType.Maskbook) return maskbookChainId
    if (wallet?.provider === ProviderType.MetaMask) return metamaskChainId
    if (wallet?.provider === ProviderType.WalletConnect) return walletconnectChainId
    return ChainId.Mainnet
}
