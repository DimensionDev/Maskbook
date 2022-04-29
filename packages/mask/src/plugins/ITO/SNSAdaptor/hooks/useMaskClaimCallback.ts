import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType, useAccount, useChainId } from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import { useMaskITO_Contract } from './useMaskITO_Contract'

export function useMaskClaimCallback() {
    const account = useAccount()
    const chainId = useChainId()
    const MaskITO_Contract = useMaskITO_Contract()
    const [loading, setLoading] = useState(false)

    const claimCallback = useCallback(async () => {
        if (!MaskITO_Contract) return

        setLoading(true)
        // estimate gas and compose transaction
        const config = {
            from: account,
            gas: await MaskITO_Contract.methods
                .claim()
                .estimateGas({
                    from: account,
                })
                .catch((error) => {
                    setLoading(false)
                    throw error
                }),
        }

        // send transaction and wait for hash
        return new Promise<string>(async (resolve, reject) => {
            MaskITO_Contract.methods
                .claim()
                .send(config as NonPayableTx)
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        })
    }, [account, chainId, MaskITO_Contract])

    return [loading, claimCallback] as const
}
