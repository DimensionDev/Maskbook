import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { once } from 'lodash-unified'
import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { TransactionEventType } from '../types'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useAccount } from './useAccount'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { TransactionStateType, useTransactionState } from './useTransactionState'
import { isLessThan } from '../utils'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveStateType {
    UNKNOWN = 0,
    NOT_APPROVED = 1,
    UPDATING = 2,
    PENDING = 3,
    APPROVED = 4,
    FAILED = 5,
}

export function useERC20TokenApproveCallback(address?: string, amount?: string, spender?: string) {
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
        if (transactionState.type === TransactionStateType.WAIT_FOR_CONFIRMING) return ApproveStateType.PENDING
        return isLessThan(allowance, amount) ? ApproveStateType.NOT_APPROVED : ApproveStateType.APPROVED
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
        async (useExact = false) => {
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
                    error: new Error('Failed to approve token.'),
                })
                return
            }

            // start waiting for provider to confirm tx
            setTransactionState({
                type: TransactionStateType.WAIT_FOR_CONFIRMING,
            })

            // estimate gas and compose transaction
            const config = {
                from: account,
                gas: await erc20Contract.methods
                    .approve(spender, useExact ? amount : MaxUint256)
                    .estimateGas({
                        from: account,
                    })
                    .catch((error) => {
                        useExact = !useExact
                        return erc20Contract.methods.approve(spender, amount).estimateGas({
                            from: account,
                        })
                    })
                    .catch((error) => {
                        setTransactionState({
                            type: TransactionStateType.FAILED,
                            error,
                        })
                        throw error
                    }),
            }

            // send transaction and wait for hash
            return new Promise<void>(async (resolve, reject) => {
                const revalidate = once(() => {
                    revalidateBalance()
                    revalidateAllowance()
                })
                erc20Contract.methods
                    .approve(spender, useExact ? amount : MaxUint256)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.RECEIPT, (receipt) => {
                        setTransactionState({
                            type: TransactionStateType.CONFIRMED,
                            no: 0,
                            receipt,
                        })
                        revalidate()
                        resolve()
                    })
                    .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                        setTransactionState({
                            type: TransactionStateType.CONFIRMED,
                            no,
                            receipt,
                        })
                        revalidate()
                        resolve()
                    })
                    .on(TransactionEventType.ERROR, (error) => {
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
