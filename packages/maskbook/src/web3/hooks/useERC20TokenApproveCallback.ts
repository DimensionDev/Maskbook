import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import { once } from 'lodash-es'
import type { TransactionReceipt } from 'web3-eth'
import type { Tx } from '@dimensiondev/contracts/types/types'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { addGasMargin } from '../helpers'
import { TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { TransactionStateType, useTransactionState } from './useTransactionState'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveStateType {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    UPDATING,
    PENDING,
    APPROVED,
    FAILED,
}

export function useERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transactionState, setTransactionState] = useTransactionState()

    // read the approved information from the chain
    const {
        value: balance = '0',
        loading: loadingBalance,
        error: errorBalance,
        retry: revalidateBalance,
    } = useERC20TokenBalance(address)
    const {
        value: allowance = '0',
        loading: loadingAllowance,
        error: errorAllowance,
        retry: revalidateAllowance,
    } = useERC20TokenAllowance(address, spender)

    // the computed approve state
    const approveStateType = useMemo(() => {
        if (!amount || !spender) return ApproveStateType.UNKNOWN
        if (loadingBalance || loadingAllowance) return ApproveStateType.UPDATING
        if (errorBalance || errorAllowance) return ApproveStateType.FAILED
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveStateType.INSUFFICIENT_BALANCE
        if (transactionState.type === TransactionStateType.WAIT_FOR_CONFIRMING) return ApproveStateType.PENDING
        return new BigNumber(allowance).isLessThan(amount) ? ApproveStateType.NOT_APPROVED : ApproveStateType.APPROVED
    }, [
        amount,
        spender,
        balance,
        allowance,
        errorBalance,
        errorAllowance,
        loadingAllowance,
        loadingBalance,
        transactionState.type,
    ])

    const approveCallback = useCallback(
        async (useExact: boolean = false) => {
            if (approveStateType === ApproveStateType.UNKNOWN || !amount || !spender || !erc20Contract) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED) {
                setTransactionState({
                    type: TransactionStateType.FAILED,
                    error: new Error('Failed to approve token'),
                })
                return
            }

            // pre-step: start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            const config: Tx = {
                from: account,
                to: erc20Contract.options.address,
            }

            // step 1: estimate gas
            const estimatedGas = await erc20Contract.methods
                // general fallback for tokens who restrict approval amounts
                .approve(spender, useExact ? amount : MaxUint256)
                .estimateGas(config)
                .catch(() => {
                    // if the current approve strategy is failed
                    // then use oppsite strategy instead
                    useExact = !useExact
                    return erc20Contract.methods.approve(spender, amount).estimateGas({
                        from: account,
                        to: erc20Contract.options.address,
                    })
                })

            // step 2: blocking
            return new Promise<void>(async (resolve, reject) => {
                const promiEvent = erc20Contract.methods.approve(spender, useExact ? amount : MaxUint256).send({
                    gas: addGasMargin(new BigNumber(estimatedGas)).toFixed(),
                    ...config,
                })
                const revalidate = once(() => {
                    revalidateBalance()
                    revalidateAllowance()
                })
                promiEvent.on(TransactionEventType.RECEIPT, (receipt: TransactionReceipt) => {
                    setTransactionState({
                        type: TransactionStateType.CONFIRMED,
                        no: 0,
                        receipt,
                    })
                    revalidate()
                })
                promiEvent.on(TransactionEventType.CONFIRMATION, (no: number, receipt: TransactionReceipt) => {
                    setTransactionState({
                        type: TransactionStateType.CONFIRMED,
                        no,
                        receipt,
                    })
                    revalidate()
                    resolve()
                })
                promiEvent.on(TransactionEventType.ERROR, (error: Error) => {
                    setTransactionState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    revalidate()
                    reject(error)
                })
            })
        },
        [account, amount, balance, spender, loadingAllowance, loadingBalance, erc20Contract, approveStateType],
    )

    const resetCallback = useCallback(() => {
        revalidateBalance()
        revalidateAllowance()
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [revalidateBalance, revalidateAllowance])

    return [
        {
            type: approveStateType,
            allowance,
            amount,
            spender,
            balance,
        },
        transactionState,
        approveCallback,
        resetCallback,
    ] as const
}
