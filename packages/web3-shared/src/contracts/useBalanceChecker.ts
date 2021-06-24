import BalanceCheckerABI from '@masknet/contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/contracts/types/BalanceChecker'
import type { AbiItem } from 'web3-utils'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'

export function useBalanceCheckerContract() {
    const { BALANCE_CHECKER_ADDRESS } = useConstant(CONSTANTS)
    return useContract<BalanceChecker>(BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
}
