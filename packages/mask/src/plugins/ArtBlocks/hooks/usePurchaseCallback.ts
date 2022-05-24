import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { EthereumTokenType, TransactionEventType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useAsyncFn } from 'react-use'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(projectId: string, amount: string, tokenType?: number) {
    const account = useAccount()
    const chainId = useChainId()

    const genArt721MinterContract = useArtBlocksContract()

    return useAsyncFn(async () => {
        if (!genArt721MinterContract) return

        const value = new BigNumber(tokenType === EthereumTokenType.Native ? amount : 0).toFixed()
        const config = {
            from: account,
            value,
            gas: await genArt721MinterContract.methods
                .purchase(projectId)
                .estimateGas({
                    from: account,
                    value,
                })
                .catch((error) => {
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            genArt721MinterContract.methods
                .purchase(projectId)
                .send(config as PayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, amount, chainId, genArt721MinterContract, tokenType])
}
