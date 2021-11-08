import { PluginNFTAvatarRPC } from '../messages'
import { useAsync } from 'react-use'

export function useGetAddresses() {
    return useAsync(async () => {
        const addresses = await PluginNFTAvatarRPC.getUserAddresses()
        const result = await Promise.all(
            addresses.map(async (address) => {
                return {
                    file: await PluginNFTAvatarRPC.getRSSNode(address),
                    address,
                }
            }),
        )

        return result
    }, [])
}
