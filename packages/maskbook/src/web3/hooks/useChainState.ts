import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId, ProviderType } from '../types'
import {
    currentChainStateSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import type { ChainState } from '../../settings/types'
import { useWallet } from '../../plugins/Wallet/hooks/useWallet'
import { Flags } from '../../utils/flags'
import { currentSelectedWalletProviderSettings } from '../../plugins/Wallet/settings'

/**
 * Get the chain id which is using by the given (or default) wallet
 */
export function useChainId() {
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
 * Retruns true if chain id is available
 */
export function useChainIdValid() {
    const chainId = useChainId()
    const selectedWallet = useWallet()
    return !Flags.wallet_network_strict_mode_enabled || chainId === ChainId.Mainnet || !selectedWallet
}

/**
 * Get the current block number
 */
export function useBlockNumber(chainId: ChainId) {
    return useChainState(chainId).blockNumber
}

/**
 * Get the current block number for once
 */
export function useBlockNumberOnce(chainId: ChainId) {
    const chainState_ = useChainState(chainId)
    const [chainState, setChainState] = useState({
        chainId: ChainId.Mainnet,
        blockNumber: 0,
    })
    useEffect(() => {
        if (chainState.blockNumber === 0 || chainState.chainId !== chainState_.chainId) setChainState(chainState_)
    }, [chainState_])
    return chainState.blockNumber
}

/**
 * Get the newest chain state
 */
const DEFAULT_CHAIN_STATE = {
    chainId: ChainId.Mainnet,
    blockNumber: 0,
}

export function useChainState(chainId: ChainId) {
    const chainState = useValueRef(currentChainStateSettings)
    try {
        const parsedChainState = JSON.parse(chainState) as ChainState[]
        return parsedChainState.find((x) => x.chainId === chainId) ?? DEFAULT_CHAIN_STATE
    } catch (e) {
        return DEFAULT_CHAIN_STATE
    }
}
