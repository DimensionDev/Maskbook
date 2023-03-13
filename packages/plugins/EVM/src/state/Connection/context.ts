import type { RequestArguments } from 'web3-core'
import { ProviderType, ConnectionContext, ChainId } from '@masknet/web3-shared-evm'
import { type BaseContractWalletProvider, EVM_Providers } from '@masknet/web3-providers'
import type { EVM_Connection, EVM_ConnectionOptions } from './types.js'
import { Web3StateSettings } from '../../settings/index.js'

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

export function createContext(
    connection: EVM_Connection,
    requestArguments: RequestArguments,
    options?: EVM_ConnectionOptions,
) {
    return new ConnectionContext(connection, requestArguments, options, initializer)
}
