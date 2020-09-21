import { useCallback, useMemo } from 'react'
import BigNumber from 'bignumber.js'
import { useAccount } from './useAccount'
import { useConstant } from './useConstant'
import { useERC20TokenContract } from '../contracts/useERC20TokenContract'
import { Token, EthereumTokenType } from '../types'
import { useTokenAllowance } from './useTokenAllowance'
import { useTokenBalance } from './useTokenBalance'

const MaxUint256 = new BigNumber('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff').toFixed()

export enum ApproveState {
    UNKNOWN,
    INSUFFICIENT_BALANCE,
    NOT_APPROVED,
    PENDING,
    APPROVED,
}

export function useTokenApproveCallback(token?: Token, amount?: string, spender?: string) {
    const ETH_ADDRESS = useConstant('ETH_ADDRESS')
    const account = useAccount()
    const erc20Contract = useERC20TokenContract(token?.address ?? ETH_ADDRESS)
    const { value: balance } = useTokenBalance(token)
    const { value: allowance } = useTokenAllowance(token, spender)

    const approveState: ApproveState = useMemo(() => {
        if (token?.type === EthereumTokenType.Ether) return ApproveState.APPROVED
        if (!amount || !spender || !allowance || !balance) return ApproveState.UNKNOWN
        if (new BigNumber(amount).isGreaterThan(new BigNumber(balance))) return ApproveState.INSUFFICIENT_BALANCE
        // TODO:
        // check pending approve
        return new BigNumber(allowance).isLessThan(amount) ? ApproveState.NOT_APPROVED : ApproveState.APPROVED
    }, [amount, spender, allowance, balance, token?.type])

    const approveCallback = useCallback(async () => {
        if (approveState !== ApproveState.NOT_APPROVED) return
        if (!erc20Contract) return
        if (!account) return
        if (!spender) return
        if (!amount || new BigNumber(amount).isZero()) return
        if (token?.type !== EthereumTokenType.ERC20) return

        let useExact = false
        const estimatedGas = await erc20Contract.methods
            // general fallback for tokens who restrict approval amounts
            .approve(spender, MaxUint256)
            .estimateGas({
                from: account,
                to: erc20Contract.options.address,
            })
            .catch(() => {
                useExact = true
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
                    else resolve(hash)
                },
            )
        })
    }, [approveState, amount, account, spender, token?.type, erc20Contract])

    return [approveState, approveCallback] as const
}
