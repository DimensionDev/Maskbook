import { useCallback, useMemo, useState } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useTransactionReceipt } from './useTransaction'
import { useERC20TokenBalance } from './useERC20TokenBalance'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveState {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    PENDING,
    APPROVED,
}

export function useERC20TokenApproveCallback(address: string, amount?: string, spender?: string) {
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(address)
    const { value: balance, retry: revalidateBalance } = useERC20TokenBalance(address)
    const { value: allowance, retry: revalidateAllowance } = useERC20TokenAllowance(address, spender)

    const [approveHash, setApproveHash] = useState('')
    const receipt = useTransactionReceipt(approveHash)

    const approveState: ApproveState = useMemo(() => {
        if (receipt?.blockHash) return ApproveState.APPROVED
        if (!amount || !spender || !allowance || !balance) return ApproveState.UNKNOWN
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveState.INSUFFICIENT_BALANCE
        if (approveHash && !receipt?.blockHash) return ApproveState.PENDING
        return new BigNumber(allowance).isLessThan(amount) ? ApproveState.NOT_APPROVED : ApproveState.APPROVED
    }, [address, amount, spender, allowance, balance, approveHash, receipt?.blockHash])

    const approveCallback = useCallback(
        async (useExact: boolean = false) => {
            if (approveState !== ApproveState.NOT_APPROVED) return
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
        [approveState, amount, account, spender, erc20Contract],
    )

    const resetCallback = useCallback(() => {
        setApproveHash('')
        revalidateBalance()
        revalidateAllowance()
    }, [])

    return [approveState, approveCallback, resetCallback] as const
}
