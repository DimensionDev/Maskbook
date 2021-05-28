import type { AbiItem } from 'web3-utils'
import ITO_ABI from '@dimensiondev/contracts/abis/ITO.json'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import { ITO_CONSTANTS } from '../constants'
import { useConstant, useContract } from '@dimensiondev/web3-shared'

export function useITO_Contract(contractAddress?: string) {
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    return useContract<ITO>(contractAddress ?? ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
}
