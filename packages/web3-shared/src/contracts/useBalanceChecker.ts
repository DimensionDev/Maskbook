import BalanceCheckerABI from '@masknet/contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/contracts/types/BalanceChecker'
import type { AbiItem } from 'web3-utils'
import { useEthereumConstants } from '../constants'
import { useContract } from '../hooks/useContract'

export function useBalanceCheckerContract() {
    const { BALANCE_CHECKER_ADDRESS } = useEthereumConstants()
    return useContract<BalanceChecker>(BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
}
