import { EthereumTokenType, FungibleTokenDetailed, TransactionEventType, useAccount } from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'
import { usePoolTogetherPoolContract } from '../contracts/usePoolTogetherPool'

/**
 * A callback for deposit into pool
 * @param address the pool address
 * @param amount
 * @param controlledToken the ticket token address
 * @param referrer
 * @param token deposit token
 */
export function useDepositCallback(
    address: string,
    amount: string,
    controlledToken: string,
    referrer: string,
    token?: FungibleTokenDetailed,
) {
    const poolContract = usePoolTogetherPoolContract(address)

    const account = useAccount()
    const [loading, setLoading] = useState(false)

    const depositCallback = useCallback(async () => {
        if (!token || !poolContract) {
            return
        }
        setLoading(true)

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }
        const estimatedGas = await poolContract.methods
            .depositTo(account, amount, controlledToken, referrer)
            .estimateGas(config)
            .catch((error) => {
                setLoading(false)
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            poolContract.methods
                .depositTo(account, amount, controlledToken, referrer)
                .send({
                    ...config,
                    gas: estimatedGas,
                })
                .on(TransactionEventType.CONFIRMATION, (_, receipt) => {
                    resolve(receipt.transactionHash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    reject(error)
                })
        }).finally(() => setLoading(false))
    }, [address, account, amount, token, referrer, controlledToken])

    return [loading, depositCallback] as const
}
