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
} from '@masknet/web3-shared'
import { useDHedgePoolContract } from '../contracts/useDHedgePool'

/**
 * A callback for invest dhedge pool
 * @param address the pool address
 * @param amount
 * @param token
 */
export function useInvestCallback(address: string, amount: string, token?: FungibleTokenDetailed) {
    const poolContract = useDHedgePoolContract(address)

    const account = useAccount()
    const nonce = useNonce()
    const gasPrice = useGasPrice()
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
            value: new BigNumber(token.type === EthereumTokenType.Native ? amount : 0).toFixed(),
            gasPrice,
            nonce,
        }
        const estimatedGas = await poolContract.methods
            .deposit(amount)
            .estimateGas(config)
            .catch((error) => {
                setInvestState({
                    type: TransactionStateType.FAILED,
                    error,
                })
                throw error
            })

        // step 2: blocking
        return new Promise<string>((resolve, reject) => {
            const promiEvent = poolContract.methods.deposit(amount).send({
                gas: addGasMargin(estimatedGas).toFixed(),
                ...config,
            })
            promiEvent
                .on(TransactionEventType.TRANSACTION_HASH, (hash) => {
                    setInvestState({
                        type: TransactionStateType.HASH,
                        hash,
                    })
                    resolve(hash)
                })
                .on(TransactionEventType.ERROR, (error) => {
                    setInvestState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    reject(error)
                })
        })
    }, [gasPrice, nonce, address, account, amount, token])

    const resetCallback = useCallback(() => {
        setInvestState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [])

    return [investState, investCallback, resetCallback] as const
}
