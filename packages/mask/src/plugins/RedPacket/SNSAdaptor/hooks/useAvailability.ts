import { useAsyncRetry } from 'react-use'
import { useAccount, useChainId, Web3Helper } from '@masknet/plugin-infra/web3'
import { NetworkPluginID } from '@masknet/web3-shared-base'
import { useRedPacketContract } from './useRedPacketContract'

export function useAvailability(id: string, version: number, options?: Web3Helper.Web3ConnectionOptions<NetworkPluginID.PLUGIN_EVM>) {
    const account= useAccount(NetworkPluginID.PLUGIN_EVM, options?.account)
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM, options?.chainId)
    const redPacketContract = useRedPacketContract(chainId, version)
    return useAsyncRetry(async () => {
        if (!id || !redPacketContract) return null
        return redPacketContract.methods.check_availability(id).call({
            // check availability is ok w/o account
            from: account,
        })
    }, [id, account, chainId])
}
