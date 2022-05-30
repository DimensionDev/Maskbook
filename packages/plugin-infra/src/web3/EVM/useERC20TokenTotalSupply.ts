import { useAsyncRetry } from 'react-use'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useChainId } from '../useChainId'
import { useERC20TokenContract } from './useERC20TokenContract'

export function useERC20TokenTotalSupply(address?: string) {
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const erc20TokenContract = useERC20TokenContract(chainId, address)
    return useAsyncRetry(async () => {
        if (!erc20TokenContract) return
        return erc20TokenContract?.methods.totalSupply().call()
    }, [chainId, erc20TokenContract])
}
