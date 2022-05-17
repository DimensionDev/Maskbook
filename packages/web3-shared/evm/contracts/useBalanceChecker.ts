import BalanceCheckerABI from '@masknet/web3-contracts/abis/BalanceChecker.json'
import type { BalanceChecker } from '@masknet/web3-contracts/types/BalanceChecker'
import type { AbiItem } from 'web3-utils'
import { useEthereumConstants } from '../constants'
import { useChainId } from '../hooks'
import { useContract } from '../hooks/useContract'
import type { ChainId } from '../types'

export function useBalanceCheckerContract(chainId?: ChainId) {
    const _chainId = useChainId()
    const { BALANCE_CHECKER_ADDRESS } = useEthereumConstants(chainId)
    return useContract<BalanceChecker>(chainId ?? _chainId, BALANCE_CHECKER_ADDRESS, BalanceCheckerABI as AbiItem[])
}
