import type { RequestArguments } from 'web3-core'
import { ProviderType, ConnectionContext } from '@masknet/web3-shared-evm'
import type { EVM_Connection, EVM_Web3ConnectionOptions } from './types.js'
import { Providers } from './provider.js'
import { SharedContextSettings, Web3StateSettings } from '../../settings/index.js'
import type { BaseContractWalletProvider } from './providers/BaseContractWallet.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? SharedContextSettings.value.account.getCurrentValue()
            : Web3StateSettings.value.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? SharedContextSettings.value.chainId.getCurrentValue()
            : Web3StateSettings.value.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return Web3StateSettings.value.Provider?.providerType?.getCurrentValue()
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

export function createContext(
    connection: EVM_Connection,
    requestArguments: RequestArguments,
    options?: EVM_Web3ConnectionOptions,
) {
    return new ConnectionContext(connection, requestArguments, options, initializer)
}
