import type { PayableTx } from '@masknet/web3-contracts/types/types'
import { EthereumTokenType, TransactionEventType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { useArtBlocksContract } from './useArtBlocksContract'

export function usePurchaseCallback(projectId: string, amount: string, tokenType?: number) {
    const account = useAccount()
    const chainId = useChainId()

    const genArt721MinterContract = useArtBlocksContract()
    const [loading, setLoading] = useState(false)

    const purchaseCallback = useCallback(async () => {
        if (!genArt721MinterContract) return

        setLoading(true)
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
                    setLoading(false)
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
        }).finally(() => setLoading(false))
    }, [account, amount, chainId, genArt721MinterContract, tokenType])

    return [loading, purchaseCallback] as const
}
