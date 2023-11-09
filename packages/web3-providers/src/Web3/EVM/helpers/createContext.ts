import { ProviderType, ChainId, type RequestArguments } from '@masknet/web3-shared-evm'
import { Providers } from '../providers/index.js'
import type { BaseEIP4337WalletProvider } from '../providers/BaseContractWallet.js'
import { Web3StateRef } from '../apis/Web3StateAPI.js'
import { ConnectionContext } from '../libs/ConnectionContext.js'
import type { EVMConnectionOptions } from '../types/index.js'

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
        const provider = Providers[providerType] as BaseEIP4337WalletProvider | undefined
        return provider?.ownerAccount
    },
    getDefaultIdentifier(providerType: ProviderType) {
        const provider = Providers[providerType] as BaseEIP4337WalletProvider | undefined
        return provider?.ownerIdentifier
    },
}

export function createContext(requestArguments: RequestArguments, options?: EVMConnectionOptions) {
    return new ConnectionContext(requestArguments, options, initializer)
}
