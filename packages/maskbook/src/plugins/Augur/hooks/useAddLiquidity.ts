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
import { LiquidityActionType, LiquidityBreakdown, Market } from '../types'
import { currentSlippageSettings } from '../../Trader/settings'

export function useAddLiquidityCallback(
    amount: string,
    breakdown?: LiquidityBreakdown,
    market?: Market,
    token?: FungibleTokenDetailed,
) {
    const ammContract = useAmmFactory(market?.ammAddress ?? '')

    const account = useAccount()
    const [state, setState] = useTransactionState()
    const minTokenOut = new BigNumber(breakdown?.lpTokens ?? 0)
        .multipliedBy(1 - currentSlippageSettings.value / 10000)
        .toFixed(0)

    const callback = useCallback(async () => {
        if (!token || !ammContract || !market || !breakdown) {
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

        const action =
            breakdown.type === LiquidityActionType.Create
                ? ammContract.methods.createPool(market.address, market.id, amount, account)
                : ammContract.methods.addLiquidity(market.address, market.id, amount, minTokenOut, account)

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
    }, [account, amount, token, minTokenOut, market, breakdown])

    const resetCallback = useCallback(() => {
        setState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [state, callback, resetCallback] as const
}
