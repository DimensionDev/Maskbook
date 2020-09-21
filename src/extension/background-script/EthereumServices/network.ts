import { createWeb3 } from './web3'
import { createProvider } from './providers/Maskbook'
import type { TransactionConfig } from 'web3-core'
import { ChainId, ProviderType } from '../../../web3/types'
import { getDefaultWallet } from '../../../plugins/Wallet/wallet'
import {
    currentMaskbookChainIdSettings,
    currentMetaMaskChainIdSettings,
    currentWalletConnectChainIdSettings,
} from '../../../settings/settings'

export async function getChainId() {
    const wallet = await getDefaultWallet()
    if (wallet?.provider === ProviderType.Maskbook) return currentMaskbookChainIdSettings.value
    if (wallet?.provider === ProviderType.MetaMask) return currentMetaMaskChainIdSettings.value
    if (wallet?.provider === ProviderType.WalletConnect) return currentWalletConnectChainIdSettings.value
    return ChainId.Mainnet
}

export function getGasPrice() {
    return createWeb3(createProvider()).eth.getGasPrice()
}

export function getBlockNumber() {
    return createWeb3(createProvider()).eth.getBlockNumber()
}

export function getBalance(address: string) {
    return createWeb3(createProvider()).eth.getBalance(address)
}

export function getTransaction(id: string) {
    return createWeb3(createProvider()).eth.getTransaction(id)
}

export function getTransactionReceipt(id: string) {
    return createWeb3(createProvider()).eth.getTransactionReceipt(id)
}

export function getTransactionCount(address: string) {
    return createWeb3(createProvider()).eth.getTransactionCount(address)
}

export function estimateGas(config: TransactionConfig) {
    return createWeb3(createProvider()).eth.estimateGas(config)
}
