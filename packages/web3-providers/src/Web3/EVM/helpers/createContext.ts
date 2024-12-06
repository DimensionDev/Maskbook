import { type RequestArguments } from '@masknet/web3-shared-evm'
import { evm } from '../../../Manager/registry.js'
import { ConnectionContext } from '../libs/ConnectionContext.js'
import type { EVMConnectionOptions } from '../types/index.js'

const initializer = {
    getDefaultAccount() {
        return evm.state?.Wallet?.account?.getCurrentValue()
    },
    getDefaultChainId() {
        return evm.state?.Wallet?.chainId?.getCurrentValue()
    },
}

export function createContext(requestArguments: RequestArguments, options?: EVMConnectionOptions) {
    return new ConnectionContext(requestArguments, options, initializer)
}
