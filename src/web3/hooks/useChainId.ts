import { useMemo } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { ProviderType } from '../types'
import { useDefaultWallet } from '../../plugins/Wallet/hooks/useWallet'
import { ChainId } from '../types'

/**
 * Get the chain id which is using by current wallet
 */
export function useChainId() {
    const { data: wallet } = useDefaultWallet()
    const maskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const metamaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const walletconnectChainId = useValueRef(currentWalletConnectChainIdSettings)
    return useMemo(() => {
        if (wallet?.provider === ProviderType.Maskbook) return maskbookChainId
        if (wallet?.provider === ProviderType.MetaMask) return metamaskChainId
        if (wallet?.provider === ProviderType.WalletConnect) return walletconnectChainId
        return ChainId.Mainnet
    }, [wallet?.provider, maskbookChainId, metamaskChainId, walletconnectChainId])
}
