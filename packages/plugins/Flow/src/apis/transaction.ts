import { MutateOptions, TransactionObject, TransactionStatusCode } from '@blocto/fcl'
import { unreachable } from '@dimensiondev/kit'
import { TransactionStatusType } from '@masknet/plugin-infra'
import { ChainId, createClient } from '@masknet/web3-shared-flow'
import { FlagCircle } from '@mui/icons-material'

export async function getTransaction(chainId: ChainId, id: string): Promise<TransactionObject> {
    const sdk = createClient(chainId)
    return sdk.send([sdk.getTransaction(id)]).then(sdk.decode)
}

/**
 * Get transaction status
 * Learn more at: https://docs.onflow.org/fcl/reference/api/#transaction-statuses
 *
 * @param chainId
 * @param id
 * @returns
 */
export async function getTransactionStatus(chainId: ChainId, id: string): Promise<TransactionStatusType> {
    const sdk = createClient(chainId)
    const code: TransactionStatusCode = await sdk.send([sdk.getTransactionStatus(id)]).then(sdk.decode)

    switch (code) {
        case TransactionStatusCode.UNKNOWN:
        case TransactionStatusCode.PENDING:
        case TransactionStatusCode.FINALIZED:
        case TransactionStatusCode.EXECUTED:
            return TransactionStatusType.NOT_DEPEND
        case TransactionStatusCode.SEALED:
            return TransactionStatusType.SUCCEED
        case TransactionStatusCode.EXPIRED:
            return TransactionStatusType.FAILED
        default:
            unreachable(code)
    }
}

export async function signTransaction(chainId: ChainId, address: string, id: string) {}

export async function sendTransaction(chainId: ChainId, options: MutateOptions) {
    const sdk = createClient(chainId)
    const txId = await sdk.mutate(options)
    await sdk.tx(txId).onceSealed()
    return txId
}
