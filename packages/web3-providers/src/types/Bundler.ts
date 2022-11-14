import type { ChainId, UserOperation } from '@masknet/web3-shared-evm'

export namespace BundlerAPI {
    export interface Provider {
        /** Get the address of the signer who drafts and broadcasts the transaction. */
        getSigner(): Promise<string>
        /** Get all supported chain ids. */
        getSupportedChainIds(): Promise<ChainId[]>
        /** Get all supported entry contracts. */
        getSupportedEntryPoints(): Promise<string[]>
        /** Simulate a user operation. */
        simulateUserOperation(
            chainId: ChainId,
            userOperation: UserOperation,
        ): Promise<{
            preOpGas: string
            prefund: string
        }>
        /** Send a user operation. */
        sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string>
    }
}
