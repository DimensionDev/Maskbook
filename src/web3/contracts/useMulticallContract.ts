import type { AbiItem } from 'web3-utils'
import MulticallABI from '../../contracts/multicall/Multicall.json'
import type { Multicall } from '../../contracts/multicall/Multicall'
import { useContract } from '../hooks/useContract'
import { CONSTANTS } from '../constants'
import { useConstant } from '../hooks/useConstant'

export function useMulticallContract() {
    const address = useConstant(CONSTANTS, 'MULTICALL_ADDRESS')
    return useContract<Multicall>(address, MulticallABI as AbiItem[])
}
