import { skipToken, useQuery } from '@tanstack/react-query'
import { NameServiceID, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { Lens } from '@masknet/web3-providers'

export function useReverseAddress<T extends NetworkPluginID>(
    pluginID?: T,
    address?: string,
    domainOnly?: boolean,
    preferredType?: NameServiceID,
) {
    const { NameService } = useWeb3State(pluginID)

    return useQuery({
        queryKey: ['reverse', address, domainOnly, preferredType],
        enabled: !!NameService?.reverse,
        queryFn:
            NameService ?
                async () => {
                    if (!address) return null
                    if (preferredType === NameServiceID.Lens) {
                        const result = await Lens.reverse?.(address)
                        if (result) return result
                    }
                    return (await NameService?.reverse?.(address, domainOnly)) || null
                }
            :   skipToken,
    })
}
