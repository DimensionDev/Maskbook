import { PluginNFTAvatarRPC } from '../messages'
import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'
import type { RSS3Content } from 'rss3-next/types/rss3'

export function useGetAddresses(): AsyncState<
    {
        file: RSS3Content | undefined
        address: any
    }[]
> {
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
