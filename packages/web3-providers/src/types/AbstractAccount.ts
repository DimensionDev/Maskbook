import type { ECKeyIdentifier } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Signer } from '@masknet/web3-shared-evm'

export namespace AbstractAccountAPI {
    export interface Options {
        paymentToken?: string
    }

    export interface Provider<
        T extends NetworkPluginID,
        ChainId = Web3Helper.Definition[T]['ChainId'],
        Transaction = Web3Helper.Definition[T]['Transaction'],
        UserOperation = Web3Helper.Definition[T]['UserOperation'],
    > {
        /** Deploy a new account. */
        deploy(chainId: ChainId, owner: string, signer: Signer<ECKeyIdentifier> | Signer<string>): Promise<string>
        /** Transfer some native tokens to recipient. */
        transfer(
            chainId: ChainId,
            owner: string,
            sender: string,
            recipient: string,
            amount: string,
            signer: Signer<ECKeyIdentifier> | Signer<string>,
        ): Promise<string>
        /** Change account ownership to a new owner. */
        changeOwner(
            chainId: ChainId,
            owner: string,
            sender: string,
            recipient: string,
            signer: Signer<ECKeyIdentifier> | Signer<string>,
        ): Promise<string>
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
