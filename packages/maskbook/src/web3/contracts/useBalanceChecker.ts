import BalanceCheckerABI from '@dimensiondev/contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@dimensiondev/contracts/types/BalanceChecker'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'

export function useBalanceCheckerContract() {
    const address = useConstant(CONSTANTS, 'BALANCE_CHECKER_ADDRESS')
    return useContract<BalanceChecker>(address, BalanceCheckerABI)
}
