import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { addGasMargin } from '../../../web3/helpers'
import { TransactionStateType, useTransactionState } from '../../../web3/hooks/useTransactionState'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { useDHedgePoolContract } from '../contracts/useDHedgePool'
import { useAccount } from '../../../web3/hooks/useAccount'

/**
 * A callback for donate gitcoin grant
 * @param address the donor address
 * @param amount
 * @param token
 */
export function useInvestCallback(address: string, amount: string, token?: EtherTokenDetailed | ERC20TokenDetailed) {
    const poolContract = useDHedgePoolContract(address)

    const account = useAccount()
    const [donateState, setDonateState] = useTransactionState()

    const investCallback = useCallback(async () => {
        if (!token || !poolContract) {
            setDonateState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setDonateState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config: Tx = {
            from: account,
            to: poolContract.options.address,
            value: new BigNumber(token.type === EthereumTokenType.Ether ? amount : 0).toFixed(),
        }
        const estimatedGas = await poolContract.methods
            .deposit(amount)
            .estimateGas(config)
            .catch((error) => {
                setDonateState({
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
                (error, hash) => {
                    if (error) {
                        setDonateState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        reject(error)
                    } else {
                        setDonateState({
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
        setDonateState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [donateState, investCallback, resetCallback] as const
}
