import { toFixed } from '@masknet/web3-shared-base'
import { EthereumTokenType, FungibleTokenDetailed, TransactionEventType, useAccount } from '@masknet/web3-shared-evm'
import { useCallback, useState } from 'react'
import { useDHedgePoolV1Contract, useDHedgePoolV2Contract } from '../contracts/useDHedgePool'
import { Pool, PoolType } from '../types'

/**
 * A callback for invest dhedge pool
 * @param pool the pool
 * @param amount
 * @param token
 */
export function useInvestCallback(pool: Pool | undefined, amount: string, token?: FungibleTokenDetailed) {
    const poolV1Contract = useDHedgePoolV1Contract(pool?.address ?? '')
    const poolV2Contract = useDHedgePoolV2Contract(pool?.address ?? '')

    const account = useAccount()
    const [loading, setLoading] = useState(false)

    const investCallback = useCallback(async () => {
        if (!token || !poolV1Contract || !poolV2Contract) return

        // step 1: estimate gas
        const config = {
            from: account,
            value: toFixed(token.type === EthereumTokenType.Native ? amount : 0),
        }

        const deposit = () => {
            return pool?.poolType === PoolType.v1
                ? poolV1Contract.methods.deposit(amount)
                : poolV2Contract.methods.deposit(token.address, amount)
        }

        setLoading(true)
        const estimatedGas = await deposit()
            .estimateGas(config)
            .catch((error) => {
                setLoading(false)
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            deposit()
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .once(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, reject)
        })
    }, [pool, account, amount, token])

    return [loading, investCallback] as const
}
