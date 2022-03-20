import type { PayableTx } from '@masknet/web3-contracts/types/types'
import {
    EthereumTokenType,
    TransactionEventType,
    TransactionStateType,
    useAccount,
    useChainId,
    useTransactionState,
} from '@masknet/web3-shared-evm'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { useIdeaMarketMultiActionContract } from './useMultiActionContract'

interface useBuyTokenCallbackProps {
    ideaTokenPrice: string
    inputCurrency: string
    ideaToken: string
    amount: number | string
    fallbackAmount: number | string
    cost: number | string
    lockDuration: number | string
    recipient: string
    tokenType: EthereumTokenType
}

export function useBuyTokenCallback(
    inputCurrency: string,
    ideaToken: string,
    amount: number | string,
    fallbackAmount: number | string,
    cost: number | string,
    tokenType: EthereumTokenType,
) {
    const account = useAccount()
    const chainId = useChainId()

    const multiActionContract = useIdeaMarketMultiActionContract()
    const [buyState, setBuyState] = useTransactionState()

    const lockDuration = 0

    const buyCallback = useCallback(async () => {
        if (!multiActionContract) {
            setBuyState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        setBuyState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        const value = new BigNumber(tokenType === EthereumTokenType.Native ? amount : 0).toFixed()
        const config = {
            from: account,
            value,
            gas: await multiActionContract.methods
                .convertAndBuy(inputCurrency, ideaToken, amount, fallbackAmount, cost, lockDuration, account)
                .estimateGas({
                    from: account,
                    value: value,
                })
                .catch((error) => {
                    setBuyState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    throw error
                }),
        }

        return new Promise<void>(async (resolve, reject) => {
            multiActionContract.methods
                .convertAndBuy(inputCurrency, ideaToken, amount, fallbackAmount, cost, lockDuration, account)
                .send(config as PayableTx)
                .on(TransactionEventType.RECEIPT, (receipt) => {
                    setBuyState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    resolve()
                })
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setBuyState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve()
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setBuyState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [account, amount, chainId, multiActionContract, tokenType])

    const resetCallback = useCallback(() => {
        setBuyState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [buyState, buyCallback, resetCallback] as const
}
