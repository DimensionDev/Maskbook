import { ProviderType, ChainId, type RequestArguments } from '@masknet/web3-shared-evm'
import { evm } from '../../../Manager/registry.js'
import { ConnectionContext } from '../libs/ConnectionContext.js'
import type { EVMConnectionOptions } from '../types/index.js'

const initializer = {
    getDefaultAccount(providerType: ProviderType) {
        return providerType === ProviderType.Firefly ? '' : evm.state?.Provider?.account?.getCurrentValue()
    },
    getDefaultChainId(providerType: ProviderType) {
        return providerType === ProviderType.Firefly ?
                ChainId.Mainnet
            :   evm.state?.Provider?.chainId?.getCurrentValue()
    },
    getDefaultProviderType() {
        return evm.state?.Provider?.providerType?.getCurrentValue()
    },
}

export function createConnectionContext(requestArguments: RequestArguments, options?: EVMConnectionOptions) {
    return new ConnectionContext(requestArguments, options, initializer)
}
