import type { ChainId, UserOperation } from '@masknet/web3-shared-evm'

export namespace BundlerAPI {
    export interface Provider {
        simulate(
            chainId: ChainId,
            userOperation: UserOperation,
        ): Promise<{
            preOpGas: string
            prefund: string
        }>
        send(chainId: ChainId, userOperation: UserOperation): Promise<string>
    }
}
