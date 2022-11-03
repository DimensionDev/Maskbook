import type { NetworkPluginID } from '@masknet/shared-base'
import { useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'

export function useAddressLabel(address: string, pluginID?: NetworkPluginID): string {
    const { Others } = useWeb3State()

    const { value } = useReverseAddress(pluginID, address)
    const label = value ?? Others?.formatAddress(address, 4) ?? address
    return label
}
