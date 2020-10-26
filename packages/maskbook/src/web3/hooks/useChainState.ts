import { useEffect, useState } from 'react'
import { useValueRef } from '../../utils/hooks/useValueRef'
import { ChainId, ProviderType } from '../types'
import {
    ChainState,
    currentChainStateSettings,
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../settings/settings'
import { useSelectedWallet, useWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the chain id which is using by the given (or default) wallet
 */
export function useChainId(address?: string) {
    const wallet_ = useWallet(address ?? '')
    const selectedWallet_ = useSelectedWallet()

    const MaskbookChainId = useValueRef(currentMaskbookChainIdSettings)
    const MetaMaskChainId = useValueRef(currentMetaMaskChainIdSettings)
    const WalletConnectChainId = useValueRef(currentWalletConnectChainIdSettings)

    const wallet = wallet_ ?? selectedWallet_
    if (!wallet) return MaskbookChainId
    if (wallet.provider === ProviderType.Maskbook) return MaskbookChainId
    if (wallet.provider === ProviderType.MetaMask) return MetaMaskChainId
    if (wallet.provider === ProviderType.WalletConnect) return WalletConnectChainId
    return MaskbookChainId
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
