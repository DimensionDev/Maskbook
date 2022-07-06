import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { TransactionEventType, ChainId } from '@masknet/web3-shared-evm'
import { useAsyncFn } from 'react-use'
import { useChainId } from '../../entry-web3'
import { useAccount } from '../useAccount'
import { useERC721TokenContract } from './useERC721TokenContract'

/**
 * @param contractAddress NFT contract Address.
 * @param operator Address to add to the set of authorized operators.
 * @param approved True if the operator is approved, false to revoke approval.
 */
export function useERC721ContractSetApproveForAllCallback(
    contractAddress: string | undefined,
    operator: string | undefined,
    approved: boolean,
    callback?: () => void,
    _chainId?: ChainId,
) {
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, _chainId)
    const erc721TokenContract = useERC721TokenContract(chainId, contractAddress)

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
                    callback?.()
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, erc721TokenContract, approved, contractAddress, operator])
}
