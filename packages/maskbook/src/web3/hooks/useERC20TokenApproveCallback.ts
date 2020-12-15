import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useTransactionReceipt } from './useTransaction'
import { useERC20TokenBalance } from './useERC20TokenBalance'
import { useConstant } from './useConstant'
import { CONSTANTS } from '../constants'
import type { TransactionObject } from '../../contracts/types'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveState {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    PENDING,
    APPROVED,
}

export function useERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const from = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const { value: balance, retry: revalidateBalance } = useERC20TokenBalance(address)
    const { value: allowance, retry: revalidateAllowance } = useERC20TokenAllowance(address, spender)
    const [resetState, resetUSDT] = useERC20TokenUSDTResetCallback(address, spender)

    const [approveHash, setApproveHash] = useState('')
    const receipt = useTransactionReceipt(approveHash)

    const approveState = useMemo(() => {
        if (receipt?.blockHash) return ApproveState.APPROVED
        if (!amount || !spender || !allowance || !balance) return ApproveState.UNKNOWN
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveState.INSUFFICIENT_BALANCE
        if (approveHash && !receipt?.blockHash) return ApproveState.PENDING
        return new BigNumber(allowance).isLessThan(amount) ? ApproveState.NOT_APPROVED : ApproveState.APPROVED
    }, [amount, spender, allowance, balance, approveHash, receipt?.blockHash])

    const approveCallback = useCallback(
        async (useExact = false) => {
            if (approveState !== ApproveState.NOT_APPROVED) return
            if (!from || !spender || !erc20Contract) return
            if (!amount || new BigNumber(amount).isZero()) return
            if (resetState !== ApproveState.APPROVED) {
                await resetUSDT()
            }
            const to = erc20Contract.options.address
            let approve: TransactionObject<boolean>
            let estimatedGas: number
            try {
                approve = erc20Contract.methods.approve(spender, useExact ? amount : MaxUint256)
                estimatedGas = await approve.estimateGas({ from, to })
            } catch {
                approve = erc20Contract.methods.approve(spender, amount)
                estimatedGas = await approve.estimateGas({ from, to })
            }
            const { transactionHash } = await approve.send({ gas: estimatedGas, from, to })
            setApproveHash(transactionHash)
            return transactionHash
        },
        [approveState, resetState, resetUSDT, amount, from, spender, erc20Contract],
    )

    const resetCallback = useCallback(() => {
        setApproveHash('')
        revalidateBalance()
        revalidateAllowance()
    }, [revalidateBalance, revalidateAllowance])

    return [approveState, approveCallback, resetCallback] as const
}

function useERC20TokenUSDTResetCallback(address: string, spender?: string) {
    const from = useAccount()
    const usdtAddress = useConstant(CONSTANTS, 'USDT_ADDRESS')
    const erc20Contract = useERC20TokenContract(address === usdtAddress ? address : '')

    const [approveHash, setApproveHash] = useState('')
    const receipt = useTransactionReceipt(approveHash)

    const approveState = useMemo(
        () => (receipt?.blockHash || erc20Contract === null ? ApproveState.APPROVED : ApproveState.NOT_APPROVED),
        [erc20Contract, receipt?.blockHash],
    )

    const approveCallback = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        if (!spender || !erc20Contract) return
        const approve = erc20Contract.methods.approve(spender, '0')
        const to = erc20Contract.options.address
        const estimatedGas = await approve.estimateGas({ from, to })
        const { transactionHash } = await approve.send({ gas: estimatedGas, from, to })
        setApproveHash(transactionHash)
        return transactionHash
    }, [approveState, from, spender, erc20Contract])

    return [approveState, approveCallback] as const
}
