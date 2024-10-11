import { useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { NetworkPluginID } from '@masknet/shared-base'
import { EVMWeb3 } from '@masknet/web3-providers'
import { isLessThan, toFixed, isZero } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
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
    spender?: string,
    callback?: () => void,
    tokenChainId?: ChainId,
) {
    const isNativeToken = isNativeTokenAddress(address)
    const { account, chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()

    // read the approved information from the chain
    const {
        data: balance = '0',
        isPending: loadingBalance,
        error: errorBalance,
        refetch: revalidateBalance,
    } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address, { chainId: tokenChainId })
    const {
        data: allowance = '0',
        isPending: loadingAllowance,
        error: errorAllowance,
        refetch: revalidateAllowance,
    } = useERC20TokenAllowance(address, spender, { chainId: tokenChainId })

    // the computed approve state
    const approveStateType = useMemo(() => {
        if (!amount || !spender) return ApproveStateType.UNKNOWN
        if (loadingBalance || loadingAllowance) return ApproveStateType.UPDATING
        if (errorBalance || errorAllowance) return ApproveStateType.FAILED
        return isLessThan(allowance, amount) || (allowance === amount && isZero(amount)) ?
                ApproveStateType.NOT_APPROVED
            :   ApproveStateType.APPROVED
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
                await EVMWeb3.switchChain?.(tokenChainId ?? chainId)
            }

            const hash = await EVMWeb3.approveFungibleToken(address, spender, useExact ? amount : MaxUint256, {
                chainId: tokenChainId,
            })

            const receipt = await EVMWeb3.confirmTransaction(hash, {
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
    }, [revalidateBalance])

    return [
        {
            type: approveStateType,
            allowance,
            amount,
            spender,
            balance,
            isNativeToken,
        },
        {
            ...state,
            loading: isNativeToken ? false : loadingAllowance || loadingBalance || state.loading,
            loadingApprove: isNativeToken ? false : state.loading,
            loadingAllowance: isNativeToken ? false : loadingAllowance,
        },
        approveCallback,
        resetCallback,
        revalidateAllowance,
    ] as const
}
