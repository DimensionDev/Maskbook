import { ProviderType, ChainId, type RequestArguments } from '@masknet/web3-shared-evm'
import { EVMWalletProviders } from '../providers/index.js'
import type { BaseEIP4337WalletProvider } from '../providers/BaseContractWallet.js'
import { evm } from '../../../Manager/registry.js'
import { ConnectionContext } from '../libs/ConnectionContext.js'
import type { EVMConnectionOptions } from '../types/index.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet ? '' : evm.state?.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.MaskWallet ?
                ChainId.Mainnet
            :   evm.state?.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return evm.state?.Provider?.providerType?.getCurrentValue()
    },
    getDefaultOwner(providerType: ProviderType) {
        const provider = EVMWalletProviders[providerType] as BaseEIP4337WalletProvider | undefined
        return provider?.ownerAccount
    },
    getDefaultIdentifier(providerType: ProviderType) {
        const provider = EVMWalletProviders[providerType] as BaseEIP4337WalletProvider | undefined
        return provider?.ownerIdentifier
    },
}

export function createContext(requestArguments: RequestArguments, options?: EVMConnectionOptions) {
    return new ConnectionContext(requestArguments, options, initializer)
}
