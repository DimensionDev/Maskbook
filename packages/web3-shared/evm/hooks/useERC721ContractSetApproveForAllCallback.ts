import { useCallback } from 'react'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import {
    useAccount,
    useTransactionState,
    useERC721TokenContract,
    TransactionStateType,
    TransactionEventType,
    useChainId,
} from '../index'

/**
 * @param contractAddress NFT contract Address.
 * @param operator Address to add to the set of authorized operators.
 * @param approved True if the operator is approved, false to revoke approval.
 */
export function useERC721ContractSetApproveForAllCallback(
    contractAddress: string | undefined,
    operator: string | undefined,
    approved: boolean,
) {
    const account = useAccount()
    const chainId = useChainId()
    const erc721TokenContract = useERC721TokenContract(contractAddress)
    const [approveState, setApproveState] = useTransactionState()

    const approveCallback = useCallback(async () => {
        if (!erc721TokenContract || !contractAddress || !operator) {
            setApproveState({ type: TransactionStateType.UNKNOWN })
            return
        }

        setApproveState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const config = {
            from: account,
            gas: await erc721TokenContract.methods
                .setApprovalForAll(operator, approved)
                .estimateGas({ from: account })
                .catch((error) => {
                    setApproveState({ type: TransactionStateType.FAILED, error })
                    throw error
                }),
        }

        return new Promise<void>(async (resolve, reject) => {
            erc721TokenContract.methods
                .setApprovalForAll(operator, approved)
                .send(config as NonPayableTx)
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setApproveState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setApproveState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setApproveState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, chainId, erc721TokenContract, approved, contractAddress, operator, setApproveState])

    const resetCallback = useCallback(() => {
        setApproveState({ type: TransactionStateType.UNKNOWN })
    }, [])

    return [approveState, approveCallback, resetCallback] as const
}
