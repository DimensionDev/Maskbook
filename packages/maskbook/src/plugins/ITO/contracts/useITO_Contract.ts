import ITO_BSC_POLYGON_ABI from '@masknet/contracts/abis/BscPolygonITO.json'
import ITO_ABI from '@masknet/contracts/abis/ITO.json'
import type { BscPolygonITO } from '@masknet/contracts/types/BscPolygonITO'
import type { ITO } from '@masknet/contracts/types/ITO'
import { NetworkType, useContract, useITOConstants, useNetworkType } from '@masknet/web3-shared'
import type { AbiItem } from 'web3-utils'

export function useITO_Contract(contractAddress?: string) {
    const { ITO_CONTRACT_ADDRESS, ITO_BSC_POLYGON_CONTRACT_ADDRESS } = useITOConstants()
    const ITO_CONTRACT = useContract<ITO>(contractAddress ?? ITO_CONTRACT_ADDRESS, ITO_ABI as AbiItem[])
    const ITO_BSC_POLYGON_CONTRACT = useContract<BscPolygonITO>(
        contractAddress ?? ITO_BSC_POLYGON_CONTRACT_ADDRESS,
        ITO_BSC_POLYGON_ABI as AbiItem[],
    )
    const networkType = useNetworkType()

    return networkType === NetworkType.Ethereum ? ITO_CONTRACT : ITO_BSC_POLYGON_CONTRACT
}
