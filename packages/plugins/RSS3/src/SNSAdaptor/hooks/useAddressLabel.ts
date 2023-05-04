import type { NetworkPluginID } from '@masknet/shared-base'
import { ScopedDomainsContainer, useReverseAddress, useWeb3State } from '@masknet/web3-hooks-base'

export function useAddressLabel(address: string, pluginID?: NetworkPluginID): string {
    const { Others } = useWeb3State()
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const { value } = useReverseAddress(pluginID, address)
    const domain = getDomain(address) || value
    const formattedDomain = domain ? Others?.formatDomainName(domain) : undefined
    const label = formattedDomain || Others?.formatAddress(address, 4) || address
    return label
}
