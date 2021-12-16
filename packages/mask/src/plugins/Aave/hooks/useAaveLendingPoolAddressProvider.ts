//import { PluginPooltogetherRPC } from '../messages'
import { AAVE_LENDING_POOL_ADDRESS_PROVIDER_ADDRESS } from '../constants'
import { useAaveLendingPoolAddressProviderContract } from '../contracts/useAaveLendingPoolAddressProvider'
import { useAsyncRetry } from 'react-use'
import { ChainId } from '@masknet/web3-shared-evm'
// export function usePools() {
//     const chainId = useChainId()
//     return useAsyncRetry(() => PluginPooltogetherRPC.fetchPools(chainId), [chainId])
// }

export function useAaveLendingPoolAddressProvider( chainId: ChainId= ChainId.Mainnet) {
    const address = AAVE_LENDING_POOL_ADDRESS_PROVIDER_ADDRESS
    const addrContract = useAaveLendingPoolAddressProviderContract(address, chainId)
   
    return useAsyncRetry(async () => {
		//@ts-ignore
        const poolAddress = await addrContract.methods.getLendingPool().call()
            
        return poolAddress
    }, [])
}
