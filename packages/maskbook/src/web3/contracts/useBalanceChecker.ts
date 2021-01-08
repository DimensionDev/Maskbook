import type { AbiItem } from 'web3-utils'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'
import BalanceCheckerABI from '../../../abis/BalanceChecker.json'
import type { BalanceChecker } from '../../contracts/BalanceChecker'

export function useBalanceCheckerContract() {
    const address = useConstant(CONSTANTS, 'BALANCE_CHECKER_ADDRESS')
    return useContract<BalanceChecker>(address, BalanceCheckerABI as AbiItem[])
}
