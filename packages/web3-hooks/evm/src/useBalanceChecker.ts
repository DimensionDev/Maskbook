import type { AbiItem } from 'web3-utils'
import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker.js'
import { type ChainId, useEthereumConstants } from '@masknet/web3-shared-evm'
import { useContract } from './useContract.js'

export function useBalanceCheckerContract(chainId?: ChainId) {
    const { BALANCE_CHECKER_ADDRESS } = useEthereumConstants(chainId)
    return useContract<BalanceChecker>(chainId, BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
}
