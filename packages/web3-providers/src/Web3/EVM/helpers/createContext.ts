import type { RequestArguments } from 'web3-core'
import { ProviderType, ChainId } from '@masknet/web3-shared-evm'
import { type BaseContractWalletProvider, Providers } from '@masknet/web3-providers'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { ConnectionContext } from '../libs/ConnectionContext.js'
import type { ConnectionOptions } from '../types/index.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet ? '' : Web3StateRef.value?.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? ChainId.Mainnet
            : Web3StateRef.value?.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return Web3StateRef.value?.Provider?.providerType?.getCurrentValue()
    },
    getDefaultOwner(providerType: ProviderType) {
        const provider = Providers[providerType] as BaseContractWalletProvider | undefined
        return provider?.ownerAccount
    },
    getDefaultIdentifier(providerType: ProviderType) {
        const provider = Providers[providerType] as BaseContractWalletProvider | undefined
        return provider?.ownerIdentifier
    },
}

export function createContext(requestArguments: RequestArguments, options?: ConnectionOptions) {
    return new ConnectionContext(requestArguments, options, initializer)
}
