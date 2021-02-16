import BigNumber from 'bignumber.js'
import { useCallback, useMemo } from 'react'
import { once } from 'lodash-es'
import type { TransactionReceipt } from 'web3-eth'
import type { Tx } from '../../contracts/types'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { addGasMargin } from '../helpers'
import { TransactionEventType } from '../types'
import { useAccount } from './useAccount'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { TransactionStateType, useTransactionState } from './useTransactionState'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveState {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    UPDATING,
    PENDING,
    APPROVED,
}

export function useERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const [transactionState, setTransactionState] = useTransactionState()

    // read the approved information from the chain
    const { value: balance = '0', loading: loadingBalance, retry: revalidateBalance } = useERC20TokenBalance(address)
    const { value: allowance = '0', loading: loadingAllowance, retry: revalidateAllowance } = useERC20TokenAllowance(
        address,
        spender,
    )

    // the computed approve state
    const approveState = useMemo(() => {
        if (!amount || !spender) return ApproveState.UNKNOWN
        if (loadingBalance || loadingAllowance) return ApproveState.UPDATING
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveState.INSUFFICIENT_BALANCE
        if (transactionState.type === TransactionStateType.WAIT_FOR_CONFIRMING) return ApproveState.PENDING
        return new BigNumber(allowance).isLessThan(amount) ? ApproveState.NOT_APPROVED : ApproveState.APPROVED
    }, [amount, spender, allowance, transactionState.type, loadingAllowance, loadingBalance])

    const approveCallback = useCallback(
        async (useExact: boolean = false) => {
            if (approveState === ApproveState.UNKNOWN || !amount || !spender || !erc20Contract) {
                setTransactionState({
                    type: TransactionStateType.UNKNOWN,
                })
                return
            }

            // error: failed to approve token
            if (approveState !== ApproveState.NOT_APPROVED) {
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
                promiEvent.on(TransactionEventType.ERROR, (error) => {
                    setTransactionState({
                        type: TransactionStateType.FAILED,
                        error,
                    })
                    revalidate()
                    reject(error)
                })
            })
        },
        [account, amount, balance, spender, loadingAllowance, loadingBalance, erc20Contract, approveState],
    )

    const resetCallback = useCallback(() => {
        revalidateBalance()
        revalidateAllowance()
        setTransactionState({
            type: TransactionStateType.UNKNOWN,
        })
    }, [revalidateBalance, revalidateAllowance])

    return [approveState, transactionState, approveCallback, resetCallback] as const
}
