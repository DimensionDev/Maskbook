import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId, ProviderType } from '../types'
import {
    currentBlockNumnberSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../plugins/Wallet/settings'
import type { ChainBlockNumber } from '../../settings/types'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { Flags } from '../../utils/flags'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'

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

/**
 * Get the current block number
 */
export function useBlockNumber(chainId: ChainId) {
    return useBlockNumberState(chainId).blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce(chainId: ChainId) {
    const blockNumberState = useBlockNumberState(chainId)
    const [chainState, setChainState] = useState({
        chainId: ChainId.Mainnet,
        blockNumber: 0,
    })
    useEffect(() => {
        if (chainState.blockNumber === 0 || chainState.chainId !== blockNumberState.chainId)
            setChainState(blockNumberState)
    }, [blockNumberState])
    return chainState.blockNumber
}

/**
 * Get the newest chain state
 */
const DEFAULT_CHAIN_STATE = {
    chainId: ChainId.Mainnet,
    blockNumber: 0,
}

function useBlockNumberState(chainId: ChainId) {
    const chainState = useValueRef(currentBlockNumnberSettings)
    try {
        const parsedChainState = JSON.parse(chainState) as ChainBlockNumber[]
        return parsedChainState.find((x) => x.chainId === chainId) ?? DEFAULT_CHAIN_STATE
    } catch (e) {
        return DEFAULT_CHAIN_STATE
    }
}
