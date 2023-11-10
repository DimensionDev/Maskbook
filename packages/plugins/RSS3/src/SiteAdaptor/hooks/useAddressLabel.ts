import type { NetworkPluginID } from '@masknet/shared-base'
import { ScopedDomainsContainer, useReverseAddress, useWeb3Utils } from '@masknet/web3-hooks-base'

export function useAddressLabel(address: string, pluginID?: NetworkPluginID): string {
    const Utils = useWeb3Utils()
    const { getDomain } = ScopedDomainsContainer.useContainer()

    const { data } = useReverseAddress(pluginID, address)
    const domain = getDomain(address) || data
    const formattedDomain = domain ? Utils.formatDomainName(domain) : undefined
    const label = formattedDomain || Utils.formatAddress(address, 4) || address
    return label
}
