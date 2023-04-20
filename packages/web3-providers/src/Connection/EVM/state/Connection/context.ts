import type { RequestArguments } from 'web3-core'
import {
    ProviderType,
    ConnectionContext,
    ChainId,
    type Web3Connection,
    type Web3ConnectionOptions,
} from '@masknet/web3-shared-evm'
import { type BaseContractWalletProvider, EVM_Providers } from '@masknet/web3-providers'
import { Web3StateRef } from '../../apis/Web3StateAPI.js'
import { SharedUIContextRef } from '../../../../PluginContext/index.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet ? '' : Web3StateRef.value.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet
            ? ChainId.Mainnet
            : Web3StateRef.value.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return Web3StateRef.value.Provider?.providerType?.getCurrentValue()
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
    connection: Web3Connection,
    requestArguments: RequestArguments,
    options?: Web3ConnectionOptions,
) {
    return new ConnectionContext(Web3StateRef.value, connection, requestArguments, options, {
        ...initializer,
        mask_send: SharedUIContextRef.value.send,
        mask_signWithPersona: SharedUIContextRef.value.signWithPersona,
    })
}
