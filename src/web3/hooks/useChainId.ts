import { useMemo } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { ProviderType } from '../types'
import { useWallets } from '../../plugins/Wallet/hooks/useWallet'
import { ChainId } from '../types'
import { unreachable } from '../../utils/utils'

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
        if (!defaultWallet) return ChainId.Mainnet
        if (defaultWallet.provider === ProviderType.Maskbook) return maskbookChainId
        if (defaultWallet.provider === ProviderType.MetaMask) return metamaskChainId
        if (defaultWallet.provider === ProviderType.WalletConnect) return walletconnectChainId
        unreachable(defaultWallet.provider)
    }, [defaultWallet?.address, maskbookChainId, metamaskChainId, walletconnectChainId])
}
