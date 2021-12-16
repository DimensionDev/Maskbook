//import { PluginPooltogetherRPC } from '../messages'
import { useAaveProtocolDataProviderContract } from '../contracts/useAaveProtocolDataProvider'
import { useAsyncRetry } from 'react-use'
import { AAVE_ASSETS, AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS } from '../constants'
import type { AaveReserveData, AaveAssetDetails, AavePoolReserveConfigData } from '../types'
import { formatUnits } from '@ethersproject/units'



export function useAaveProtocolPoolGetUserReserve(assetAddress: string, userAddress: string) {
    const dataProviderContract = useAaveProtocolDataProviderContract(AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS)

    return useAsyncRetry(async () => {
        //@ts-ignore
        const reserveData: any = await dataProviderContract.methods.getUserReserveData(assetAddress, userAddress).call()
        return reserveData
    }, [])
}

export function useAaveProtocolPoolGetUserReserveBalances(assetDetails: AaveAssetDetails[], userAddress: string) {
    const dataProviderContract = useAaveProtocolDataProviderContract(AAVE_PROTOCOL_DATA_PROVIDER_ADDRESS)

    return useAsyncRetry(async () => {

        const listPromises = assetDetails.map(async (asset) => {
            //@ts-ignore
            const reserveData: any = await dataProviderContract.methods.getUserReserveData(assetAddress, userAddress).call()
        
            asset.currentBalance = parseFloat(formatUnits(reserveData.currentATokenBalance, asset.decimals)) 
            return asset
        })

        return Promise.all(listPromises)

    }, [])
}

