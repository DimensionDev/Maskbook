//import { PluginPooltogetherRPC } from '../messages'
import { useAaveProtocolDataProviderContract } from '../contracts/useAaveProtocolDataProvider'
import { useAsyncRetry } from 'react-use'
import { AAVE_ASSETS, AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS } from '../constants'
import type { AaveReserveData, AaveAssetDetails, AavePoolReserveConfigData } from '../types'
import { formatUnits } from '@ethersproject/units'

// export function usePools() {
//     const chainId = useChainId()
//     return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
// }

export function useAaveLendingPoolGetReserveData(assetAddress: string) {
    const dataProviderContract = useAaveProtocolDataProviderContract(AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS)

    return useAsyncRetry(async () => {
        //@ts-ignore
        const reserveData: AaveReserveData = await dataProviderContract.methods.getReserveData(assetAddress).call()
        return reserveData
    }, [])
}

export function useAaveLendingPoolGetListWithReserveData(userAddress: string) {
    const dataProviderContract = useAaveProtocolDataProviderContract(AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS)

    return useAsyncRetry(async () => {
        const listPromises = AAVE_ASSETS.map(async (asset) => {
            let result: AaveAssetDetails = {
                address: asset.address,
                name: asset.name,
                currentBalance: 0,
            }

            
            //@ts-ignore
            const poolReserveData: AaveReserveData = await dataProviderContract.methods
                .getReserveData(asset.address)
                .call()
            //@ts-ignore
            const poolReserveConfigData: AavePoolReserveConfigData = await dataProviderContract.methods
                .getReserveConfigurationData(asset.address)
                .call()

            //@ts-ignore
            const userReserveData: any = await dataProviderContract.methods.getUserReserveData(asset.address, userAddress).call()
        
                     

                      

            result = {...result, ...poolReserveData };
            result.decimals = parseInt(poolReserveConfigData.decimals)

            result.currentBalance = parseFloat(formatUnits(userReserveData.currentATokenBalance, result.decimals))  

            result.liquidityRate = parseFloat(formatUnits(poolReserveData?.liquidityRate ?? '0', 25))
            result.variableBorrowRate = parseFloat(formatUnits(poolReserveData?.variableBorrowRate ?? '0', 25))
            result.stableBorrowRate = parseFloat(formatUnits(poolReserveData?.stableBorrowRate ?? '0', 25))

            result.totalVariableDebt = parseFloat(formatUnits(poolReserveData?.totalVariableDebt ?? '0', result.decimals))
            result.totalStableDebt = parseFloat(formatUnits(poolReserveData?.totalStableDebt ?? '0', result.decimals))

            return result
        })

        return Promise.all(listPromises)
    }, [])
}
