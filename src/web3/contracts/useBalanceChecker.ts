import type { AbiItem } from 'web3-utils'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'
import { useContract } from '../hooks/useContract'
import type { BalanceChecker } from '../../contracts/balance-checker/BalanceChecker'
import BalanceCheckerABI from '../../contracts/balance-checker/BalanceChecker.json'
import { useChainId } from '../hooks/useChainState'

export function useBalanceCheckerContract(from: string) {
    const address = useConstant(CONSTANTS, 'BALANCE_CHECKER_ADDRESS', useChainId(from))
    return useContract<BalanceChecker>(address, BalanceCheckerABI as AbiItem[])
}
