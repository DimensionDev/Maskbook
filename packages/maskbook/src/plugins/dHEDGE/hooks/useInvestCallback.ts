import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { FungibleTokenDetailed, EthereumTokenType } from '../../../web3/types'
import { addGasMargin } from '../../../web3/helpers'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import { useDHedgePoolContract } from '../contracts/useDHedgePool'
import { useAccount } from '../../../web3/hooks/useAccount'

/**
 * A callback for invest dhedge pool
 * @param address the pool address
 * @param amount
 * @param token
 */
export function useInvestCallback(address: string, amount: string, token?: FungibleTokenDetailed) {
    const poolContract = useDHedgePoolContract(address)

    const account = useAccount()
    const [investState, setInvestState] = useTransactionState()

    const investCallback = useCallback(async () => {
        if (!token || !poolContract) {
            setInvestState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setInvestState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            to: poolContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }
        const estimatedGas = await poolContract.methods
            .deposit(amount)
            .estimateGas(config)
            .catch((error: any) => {
                setInvestState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            poolContract.methods.deposit(amount).send(
                {
                    gas: addGasMargin(estimatedGas).toFixed(),
                    ...config,
                },
                (error: any, hash: string) => {
                    if (error) {
                        setInvestState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setInvestState({
                            type: TransactionStateType.HASH,
                            hash,
                        })
                        resolve(hash)
                    }
                },
            )
        })
    }, [address, account, amount, token])

    const resetCallback = useCallback(() => {
        setInvestState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [investState, investCallback, resetCallback] as const
}
