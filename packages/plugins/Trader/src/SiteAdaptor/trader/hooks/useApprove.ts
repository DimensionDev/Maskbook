import { Sniffings } from '@masknet/shared-base'
import { useAccount } from '@masknet/web3-hooks-base'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import { EVMWeb3 } from '@masknet/web3-providers'
import { isGte, isZero } from '@masknet/web3-shared-base'
import { isNativeTokenAddress, isTransactionReceiptSuccess, type ChainId } from '@masknet/web3-shared-evm'
import { useMutation } from '@tanstack/react-query'
import { useTrade } from '../contexts/TradeProvider.js'
import { useSpender } from './useSpender.js'
import { useWaitForTransaction } from './useWaitForTransaction.js'

export function useApprove() {
    const { fromToken, amount } = useTrade()
    const chainId = fromToken?.chainId as ChainId
    const tokenAddress = fromToken?.address
    const account = useAccount()
    const { data: spender, isPending: isLoadingSpender } = useSpender()
    const {
        data: allowance = '0',
        isPending: isLoadingAllowance,
        refetch: refetchAllowance,
    } = useERC20TokenAllowance(tokenAddress, spender, {
        chainId,
    })

    const waitForTransaction = useWaitForTransaction()
    const mutation = useMutation({
        mutationKey: ['okx', 'approve-transaction', account, chainId, tokenAddress, spender, amount, allowance],
        mutationFn: async () => {
            if (!spender || !tokenAddress || isZero(amount) || isNativeTokenAddress(tokenAddress)) return
            if (isGte(allowance, amount)) return
            const hash = await EVMWeb3.approveFungibleToken(tokenAddress, spender, amount, {
                account,
                chainId,
                silent: Sniffings.is_popup_page,
            })
            const receipt = await waitForTransaction({ chainId, hash, confirmationCount: 1 })
            if (!isTransactionReceiptSuccess(receipt)) throw new Error('Failed to approve')
            await refetchAllowance()
            return hash
        },
    })
    return [
        {
            spender,
            isLoadingSpender,
            isLoadingAllowance,
        },
        mutation,
    ] as const
}
