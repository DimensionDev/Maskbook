import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { Signer } from '@masknet/web3-shared-evm'

export namespace AbstractAccountAPI {
    export interface Options {
        paymentToken?: string
    }

    export interface Provider<ChainId, UserOperation, Transaction> {
        /** Deploy a new account. */
        deploy(chainId: ChainId, owner: string, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string>

        /** Send a transaction by the account. */
        sendTransaction(
            chainId: ChainId,
            owner: string,
            transaction: Transaction,
            signer: Signer<ECKeyIdentifier> | Signer<string>,
            options?: Options,
        ): Promise<string>
        /** Send a user operation by the account. */
        sendUserOperation(
            chainId: ChainId,
            owner: string,
            userOperation: UserOperation,
            signer: Signer<ECKeyIdentifier> | Signer<string>,
            options?: Options,
        ): Promise<string>
        /** Estimate a transaction. */
        estimateTransaction(chainId: ChainId, transaction: Transaction, options?: Options): Promise<string>
        /** Estimate a user operation. */
        estimateUserOperation(chainId: ChainId, userOperation: UserOperation, options?: Options): Promise<string>
    }
}
