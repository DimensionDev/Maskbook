import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    useAccount,
    useTransactionState,
    TransactionStateType,
    addGasMargin,
    TransactionEventType,
} from '@masknet/web3-shared'
import { useAmmFactory } from '../contracts/useAmmFactory'
import { useBalancerPool } from '../contracts/useBalancerPool'
import type { AmmExchange, Market } from '../types'

export function useRemoveLiquidityCallback(
    amount: string,
    market?: Market,
    amm?: AmmExchange,
    token?: FungibleTokenDetailed,
) {
    const ammContract = useAmmFactory(market?.ammExchange?.address ?? '')
    const balancerPoolContract = useBalancerPool(amm?.lpToken?.address ?? '')

    const account = useAccount()
    const [state, setState] = useTransactionState()
    const minTokensOut = market?.outcomes.map((o) => '0') ?? []

    const callback = useCallback(async () => {
        if (!token || !ammContract || !balancerPoolContract || !market || !amm) {
            setState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
        }

        const action = market.hasWinner
            ? balancerPoolContract.methods.exitPool(amount, minTokensOut)
            : ammContract.methods.removeLiquidity(market.address, market.id, amount, '0', account)

        const estimatedGas = await action.estimateGas(config).catch((error) => {
            setState({
                type: TransactionStateType.FAILED,
                error,
            })
            throw error
        })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = action.send({
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
            })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                    setState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, token, minTokensOut, market, amm, balancerPoolContract, ammContract])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, callback, resetCallback] as const
}
