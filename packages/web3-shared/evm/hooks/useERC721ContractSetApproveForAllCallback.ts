import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { useAsyncFn } from 'react-use'
import { useERC721TokenContract } from '../contracts'
import { TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useChainId } from './useChainId'

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

    return useAsyncFn(async () => {
        if (!erc721TokenContract || !contractAddress || !operator) {
            return
        }

        const config = {
            from: account,
            gas: await erc721TokenContract.methods
                .setApprovalForAll(operator, approved)
                .estimateGas({ from: account })
                .catch((error) => {
                    throw error
                }),
        }

        return new Promise<string>(async (resolve, reject) => {
            erc721TokenContract.methods
                .setApprovalForAll(operator, approved)
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, erc721TokenContract, approved, contractAddress, operator])
}
