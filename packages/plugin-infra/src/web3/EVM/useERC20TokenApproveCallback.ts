import { isLessThan, NetworkPluginID, toFixed, isZero } from '@masknet/web3-shared-base'
import { useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useERC20TokenContract } from './useERC20TokenContract'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useWeb3Connection } from '../useWeb3Connection'
import { useChainId } from '../useChainId'
import { useAccount } from '../useAccount'
import { useFungibleTokenBalance } from '../../entry-web3'
import type { ChainId } from '@masknet/web3-shared-evm'

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
    _chainId?: ChainId,
) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, _chainId)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
    const connection = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId: _chainId })
    const erc20Contract = useERC20TokenContract(chainId, address)

    // read the approved information from the chain
    const {
        value: balance = '0',
        loading: loadingBalance,
        error: errorBalance,
        retry: revalidateBalance,
    } = useFungibleTokenBalance(NetworkPluginID.PLUGIN_EVM, address)
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
        return isLessThan(allowance, amount) || (allowance === amount && isZero(amount))
            ? ApproveStateType.NOT_APPROVED
            : ApproveStateType.APPROVED
    }, [amount, spender, balance, allowance, errorBalance, errorAllowance, loadingAllowance, loadingBalance])

    const [state, approveCallback] = useAsyncFn(
        async (useExact = false, isRevoke = false) => {
            if (approveStateType === ApproveStateType.UNKNOWN || !amount || !spender || !erc20Contract || !connection) {
                return
            }
            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED && !isRevoke) {
                return
            }

            const hash = await connection?.approveFungibleToken(address, spender, useExact ? amount : MaxUint256)
            const receipt = await connection.getTransactionReceipt(hash)

            if (receipt) {
                callback?.()
                revalidateBalance()
                revalidateAllowance()
            }
        },
        [account, amount, spender, address, erc20Contract, approveStateType, connection],
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
