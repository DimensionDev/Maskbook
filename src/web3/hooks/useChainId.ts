import { useMemo } from 'react'
import { useWallets } from '../../plugins/shared/useWallet'
import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { WalletProviderType } from '../../plugins/shared/findOutProvider'

/**
 * Get the chain id which is using by current wallet
 */
export function useChainId() {
    const { data: wallets = [] } = useWallets()
    const maskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const metamaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const walletconnectChainId = useValueRef(currentWalletConnectChainIdSettings)
    const defaultWallet = wallets.find((x) => x._wallet_is_default)

    return useMemo(() => {
        if (!defaultWallet) return null
        if (defaultWallet.type === 'managed') return maskbookChainId
        if (defaultWallet.provider === WalletProviderType.metamask) return metamaskChainId
        if (defaultWallet.provider === WalletProviderType.wallet_connect) return walletconnectChainId
        return null
    }, [defaultWallet?.address, maskbookChainId, metamaskChainId, walletconnectChainId])
}
