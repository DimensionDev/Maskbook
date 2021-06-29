import type { AbiItem } from 'web3-utils'
import ITO_ABI from '@dimensiondev/contracts/abis/ITO.json'
import ITO_BSC_POLYGON_ABI from '@dimensiondev/contracts/abis/BscPolygonITO.json'
import type { ITO } from '@dimensiondev/contracts/types/ITO'
import type { BscPolygonITO } from '@dimensiondev/contracts/types/BscPolygonITO'
import { ITO_CONSTANTS } from '../constants'
import { useConstant, useContract, useNetworkType, NetworkType } from '@dimensiondev/web3-shared'

export function useITO_Contract(contractAddress?: string) {
    const ITO_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_CONTRACT_ADDRESS')
    const ITO_BSC_POLYGON_CONTRACT_ADDRESS = useConstant(ITO_CONSTANTS, 'ITO_BSC_POLYGON_CONTRACT_ADDRESS')
    const ITO_CONTRACT = useContract<ITO>(contractAddress ?? ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
    const ITO_BSC_POLYGON_CONTRACT = useContract<BscPolygonITO>(
        contractAddress ?? ITO_BSC_POLYGON_CONTRACT_ADDRESS,
        ITO_BSC_POLYGON_ABI as AbiItem[],
    )
    const networkType = useNetworkType()

    return networkType === NetworkType.Ethereum ? ITO_CONTRACT : ITO_BSC_POLYGON_CONTRACT
}
