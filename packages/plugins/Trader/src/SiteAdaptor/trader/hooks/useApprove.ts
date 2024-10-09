import { NetworkPluginID } from '@masknet/shared-base'
import { useAccount, useWeb3Connection } from '@masknet/web3-hooks-base'
import { useERC20TokenAllowance } from '@masknet/web3-hooks-evm'
import { OKX } from '@masknet/web3-providers'
import { isGreaterThan, isZero } from '@masknet/web3-shared-base'
import { addGasMargin, type ChainId, isNativeTokenAddress } from '@masknet/web3-shared-evm'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTrade } from '../contexts/TradeProvider.js'
import { useSpender } from './useSpender.js'

export function useApprove() {
    const { fromToken, amount } = useTrade()
    const chainId = fromToken?.chainId as ChainId
    const tokenAddress = fromToken?.address
    const account = useAccount()
    const { data: approveInfo, isPending: isLoadingApproveInfo } = useQuery({
        queryKey: ['okx', 'approve-transaction', account, chainId, tokenAddress, amount],
        queryFn: async () => {
            if (!tokenAddress || isZero(amount)) return null
            if (isNativeTokenAddress(tokenAddress)) return null
            const approveInfo = await OKX.getApproveTx({
                chainId,
                tokenContractAddress: tokenAddress,
                approveAmount: amount,
            })
            return approveInfo
        },
    })

    const { data: spenderFromAPI, isPending: isLoadingSpender } = useSpender()
    const spender = approveInfo?.dexContractAddress || spenderFromAPI
    const { data: allowance = '0', isPending: isLoadingAllowance } = useERC20TokenAllowance(tokenAddress, spender, {
        chainId,
    })

    const Web3 = useWeb3Connection(NetworkPluginID.PLUGIN_EVM, { chainId })
    const mutation = useMutation({
        mutationKey: ['okx', 'approve-transaction', account, chainId, tokenAddress, amount, allowance],
        mutationFn: async () => {
            if (!approveInfo?.data || !tokenAddress || isGreaterThan(allowance, amount)) return
            return Web3.sendTransaction({
                to: tokenAddress,
                gas: addGasMargin(approveInfo.gasLimit).toFixed(0),
                gasPrice: approveInfo.gasPrice,
                data: approveInfo.data,
            })
        },
    })
    return [
        {
            spender,
            isLoadingSpender,
            isLoadingApproveInfo,
            isLoadingAllowance,
        },
        mutation,
    ] as const
}
