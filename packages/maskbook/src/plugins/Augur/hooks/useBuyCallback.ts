import { useCallback } from 'react'
import BigNumber from 'bignumber.js'
import {
    FungibleTokenDetailed,
    EthereumTokenType,
    useAccount,
    useTransactionState,
    TransactionStateType,
    useNonce,
    useGasPrice,
    addGasMargin,
    TransactionEventType,
    useAugurConstants,
} from '@masknet/web3-shared'
import { useAMMFactory } from '../contracts/useAMMFactory'
import type { AMMOutcome, Market } from '../types'

export function useBuyCallback(
    amount: string,
    slipage: number,
    market?: Market,
    outcome?: AMMOutcome,
    token?: FungibleTokenDetailed,
) {
    const { AMM_FACTORY_ADDRESS } = useAugurConstants()
    const ammContract = useAMMFactory(AMM_FACTORY_ADDRESS)

    const account = useAccount()
    const nonce = useNonce()
    const gasPrice = useGasPrice()
    const [buyState, setBuyState] = useTransactionState()

    const buyCallback = useCallback(async () => {
        if (!token || !ammContract || !market || !outcome) {
            setBuyState({
                type: TransactionStateType.UNKNOWN,
            })
            return
        }

        // pre-step: start waiting for provider to confirm tx
        setBuyState({
            type: TransactionStateType.WAIT_FOR_CONFIRMING,
        })

        // step 1: estimate gas
        const config = {
            from: account,
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
            gasPrice,
            nonce,
        }
        const estimatedGas = await ammContract.methods
            .buy(market.address, market.id, outcome.id, amount, amount)
            .estimateGas(config)
            .catch((error) => {
                setBuyState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = ammContract.methods.buy(market.address, market.id, outcome.id, amount, amount).send({
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
            })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setBuyState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setBuyState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [gasPrice, nonce, AMM_FACTORY_ADDRESS, account, amount, token])

    const resetCallback = useCallback(() => {
        setBuyState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [buyState, buyCallback, resetCallback] as const
}
