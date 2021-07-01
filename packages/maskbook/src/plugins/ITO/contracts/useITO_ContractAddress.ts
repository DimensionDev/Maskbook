import { useNetworkType, NetworkType, useITOConstants } from '@masknet/web3-shared'

export function useITO_ContractAddress() {
    const {ITO_CONTRACT_ADDRESS,ITO_BSC_POLYGON_CONTRACT_ADDRESS } = useITOConstants()
    const networkType = useNetworkType()

    return networkType === NetworkType.Ethereum ? ITO_CONTRACT_ADDRESS : ITO_BSC_POLYGON_CONTRACT_ADDRESS
}
