import { useCallback, useEffect, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useTransactionReceipt } from './useTransaction'
import { useERC20TokenBalance } from './useERC20TokenBalance'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveStateType {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    UPDATING,
    PENDING,
    APPROVED,
}

export interface ApproveState {
    type: ApproveStateType
    allowance: string
    balance: string
}

export function useERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const { value: balance = '0', loading: loadingBalance, retry: revalidateBalance } = useERC20TokenBalance(address)
    const { value: allowance = '0', loading: loadingAllowance, retry: revalidateAllowance } = useERC20TokenAllowance(
        address,
        spender,
    )

    const [approveHash, setApproveHash] = useState('')
    const receipt = useTransactionReceipt(approveHash)

    const approveStateType = useMemo(() => {
        if (loadingBalance || loadingAllowance) return ApproveStateType.UPDATING
        if (!amount || !spender || !allowance || !balance) return ApproveStateType.UNKNOWN
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveStateType.INSUFFICIENT_BALANCE
        if (approveHash && !receipt?.blockHash) return ApproveStateType.PENDING
        if (approveHash && receipt?.blockHash) return ApproveStateType.APPROVED
        return new BigNumber(allowance).isLessThan(amount) ? ApproveStateType.NOT_APPROVED : ApproveStateType.APPROVED
    }, [amount, spender, allowance, balance, approveHash, receipt?.blockHash, loadingBalance, loadingAllowance])

    const approveState = useMemo(
        () => ({
            type: approveStateType,
            address,
            amount,
            spender,
            allowance,
            balance,
        }),
        [approveStateType, address, spender, allowance, balance],
    )

    const approveCallback = useCallback(
        async (useExact: boolean = false) => {
            if (approveStateType !== ApproveStateType.NOT_APPROVED) return
            if (!account || !spender || !erc20Contract) return
            if (!amount || new BigNumber(amount).isZero()) return

            const estimatedGas = await erc20Contract.methods
                // general fallback for tokens who restrict approval amounts
                .approve(spender, useExact ? amount : MaxUint256)
                .estimateGas({
                    from: account,
                    to: erc20Contract.options.address,
                })
                .catch(() => {
                    // if the current approve strategy is failed
                    // then use oppsite strategy instead
                    useExact = !useExact
                    return erc20Contract.methods.approve(spender, amount).estimateGas({
                        from: account,
                        to: erc20Contract.options.address,
                    })
                })

            return new Promise<string>((resolve, reject) => {
                erc20Contract.methods.approve(spender, useExact ? amount : MaxUint256).send(
                    {
                        gas: estimatedGas,
                        from: account,
                        to: erc20Contract.options.address,
                    },
                    (error, hash) => {
                        if (error) reject(error)
                        else {
                            resolve(hash)
                            setApproveHash(hash)
                        }
                    },
                )
            })
        },
        [approveStateType, amount, account, spender, erc20Contract],
    )

    const resetCallback = useCallback(() => {
        setApproveHash('')
        revalidateBalance()
        revalidateAllowance()
    }, [revalidateBalance, revalidateAllowance])

    useEffect(() => {
        if (receipt?.blockHash) resetCallback()
    }, [receipt?.blockHash])

    return [approveState, approveCallback, resetCallback] as const
}
