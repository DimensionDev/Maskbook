import { useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { Web3 } from '@masknet/web3-providers'
import { isLessThan, toFixed, isZero } from '@masknet/web3-shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { useChainContext, useFungibleTokenBalance } from '@masknet/web3-hooks-base'
import { useERC20TokenAllowance } from './useERC20TokenAllowance.js'

const MaxUint256 = toFixed('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export enum ApproveStateType {
    UNKNOWN = 0,
    NOT_APPROVED = 1,
    UPDATING = 2,
    PENDING = 3,
    APPROVED = 4,
    FAILED = 5,
}

export function useERC20TokenApproveCallback(
    address: string,
    amount: string,
    spender: string,
    callback?: () => void,
    tokenChainId?: ChainId,
) {
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // read the approved information from the chain
    const {
        value: balance = '0',
        loading: loadingBalance,
        error: errorBalance,
        retry: revalidateBalance,
    } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address, { chainId: tokenChainId })
    const {
        value: allowance = '0',
        loading: loadingAllowance,
        error: errorAllowance,
        retry: revalidateAllowance,
    } = useERC20TokenAllowance(address, spender, { chainId: tokenChainId })

    // the computed approve state
    const approveStateType = useMemo(() => {
        if (!amount || !spender) return ApproveStateType.UNKNOWN
        if (loadingBalance || loadingAllowance) return ApproveStateType.UPDATING
        if (errorBalance || errorAllowance) return ApproveStateType.FAILED
        return isLessThan(allowance, amount) || (allowance === amount && isZero(amount))
            ? ApproveStateType.NOT_APPROVED
            : ApproveStateType.APPROVED
    }, [amount, spender, balance, allowance, errorBalance, errorAllowance, loadingAllowance, loadingBalance])

    const [state, approveCallback] = useAsyncFn(
        async (useExact = false, isRevoke = false) => {
            if (approveStateType === ApproveStateType.UNKNOWN || !amount || !spender) {
                return
            }
            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED && !isRevoke) {
                return
            }

            if (tokenChainId !== chainId) {
                await Web3.switchChain?.(tokenChainId ?? chainId)
            }

            const hash = await Web3.approveFungibleToken(address, spender, useExact ? amount : MaxUint256, {
                chainId: tokenChainId,
            })

            const receipt = await Web3.confirmTransaction(hash, {
                chainId: tokenChainId,
                signal: AbortSignal.timeout(5 * 60 * 1000),
            })

            if (receipt) {
                callback?.()
                revalidateBalance()
                revalidateAllowance()
            }
        },
        [account, amount, spender, address, approveStateType, tokenChainId, chainId],
    )

    const resetCallback = useCallback(() => {
        revalidateBalance()
        revalidateAllowance()
    }, [revalidateBalance, revalidateAllowance])

    return [
        {
            type: approveStateType,
            allowance,
            amount,
            spender,
            balance,
        },
        { ...state, loading: loadingAllowance || loadingBalance || state.loading, loadingApprove: state.loading },
        approveCallback,
        resetCallback,
    ] as const
}
