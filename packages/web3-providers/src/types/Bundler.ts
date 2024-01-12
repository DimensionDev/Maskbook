import type { ChainId, UserOperation } from '@masknet/web3-shared-evm'

export namespace BundlerAPI {
    export interface Healthz {
        bundler_eoa: string
        chain_id: string
        entrypoint_contract_address: string
    }

    export interface Simulation {
        preOpGas: string
        prefund: string
    }

    export interface Provider {
        /** Get the address of the signer who drafts and broadcasts the transaction. */
        getSigner(chainId: ChainId): Promise<string>
        /** Get all supported chain ids. */
        getSupportedChainId(): Promise<ChainId>
        /** Get all supported entry contracts. */
        getSupportedEntryPoints(chainId: ChainId): Promise<string[]>
        /** Send a user operation. */
        sendUserOperation(chainId: ChainId, userOperation: UserOperation): Promise<string>
    }
}
