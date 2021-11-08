import { PluginNFTAvatarRPC } from '../messages'
import { useAsync } from 'react-use'

export function useGetAddresses() {
    return useAsync(async () => {
        const addresses = await PluginNFTAvatarRPC.getUserAddresses()
        const result = await Promise.all(addresses.map((address) => PluginNFTAvatarRPC.getRSSNode(address)))
        return result
    }, [])
}
