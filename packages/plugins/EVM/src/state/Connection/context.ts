import type { RequestArguments } from 'web3-core'
import { ProviderType, ConnectionContext, ChainId, type Web3ConnectionOptions } from '@masknet/web3-shared-evm'
import { type BaseContractWalletProvider, EVM_Providers } from '@masknet/web3-providers'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? ''
            : Web3StateSettings.value.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? ChainId.Mainnet
            : Web3StateSettings.value.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return Web3StateSettings.value.Provider?.providerType?.getCurrentValue()
    },
    getDefaultOwner(providerType: ProviderType) {
        const provider = EVM_Providers[providerType] as BaseContractWalletProvider | undefined
        return provider?.ownerAccount
    },
    getDefaultIdentifier(providerType: ProviderType) {
        const provider = EVM_Providers[providerType] as BaseContractWalletProvider | undefined
        return provider?.ownerIdentifier
    },
}

export function createContext(requestArguments: RequestArguments, options?: Web3ConnectionOptions) {
    return new ConnectionContext(Web3StateSettings.value, requestArguments, options, {
        ...initializer,
        mask_send: SharedContextSettings.value.send,
        mask_signWithPersona: SharedContextSettings.value.signWithPersona,
    })
}
