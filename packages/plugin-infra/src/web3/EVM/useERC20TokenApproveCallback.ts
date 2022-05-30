import type { NonPayableTx } from '@masknet/web3-contracts/types/types'
import { isLessThan, NetworkPluginID, toFixed } from '@masknet/web3-shared-base'
import { once } from 'lodash-unified'
import { useCallback, useMemo } from 'react'
import { useAsyncFn } from 'react-use'
import { useERC20TokenContract } from './useERC20TokenContract'
import { useERC20TokenAllowance } from './useERC20TokenAllowance'
import { useChainId } from '../useChainId'
import { useAccount } from '../useAccount'
import { useFungibleTokenBalance } from '../../entry-web3'
import { TransactionEventType } from '@masknet/web3-shared-evm'

const MaxUint256 = toFixed('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff')

export enum ApproveStateType {
    UNKNOWN = 0,
    NOT_APPROVED = 1,
    UPDATING = 2,
    PENDING = 3,
    APPROVED = 4,
    FAILED = 5,
}

export function useERC20TokenApproveCallback(address?: string, amount?: string, spender?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const account = useAccount(NetworkPluginID.PLUGIN_EVM)
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
        return isLessThan(allowance, amount) ? ApproveStateType.NOT_APPROVED : ApproveStateType.APPROVED
    }, [amount, spender, balance, allowance, errorBalance, errorAllowance, loadingAllowance, loadingBalance])

    const [state, approveCallback] = useAsyncFn(
        async (useExact = false) => {
            if (approveStateType === ApproveStateType.UNKNOWN || !amount || !spender || !erc20Contract) {
                return
            }

            // error: failed to approve token
            if (approveStateType !== ApproveStateType.NOT_APPROVED) {
                return
            }

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
                        throw error
                    }),
            }

            // send transaction and wait for hash
            return new Promise<string>(async (resolve, reject) => {
                const revalidate = once(() => {
                    revalidateBalance()
                    revalidateAllowance()
                })
                erc20Contract.methods
                    .approve(spender, useExact ? amount : MaxUint256)
                    .send(config as NonPayableTx)
                    .on(TransactionEventType.RECEIPT, () => {
                        revalidate()
                    })
                    .on(TransactionEventType.CONFIRMATION, (no, receipt) => {
                        revalidate()
                        resolve(receipt.transactionHash)
                    })
                    .on(TransactionEventType.ERROR, (error) => {
                        revalidate()
                        reject(error)
                    })
            })
        },
        [account, amount, spender, erc20Contract, approveStateType],
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
        state,
        approveCallback,
        resetCallback,
    ] as const
}
