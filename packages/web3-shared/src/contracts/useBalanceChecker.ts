import { useEthereumConstants } from '@masknet/constants'
import BalanceCheckerABI from '@masknet/contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/contracts/types/BalanceChecker'
import type { AbiItem } from 'web3-utils'
import { useContract } from '../hooks/useContract'

export function useBalanceCheckerContract() {
    const { BALANCE_CHECKER_ADDRESS } = useEthereumConstants()
    return useContract<BalanceChecker>(BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
}
