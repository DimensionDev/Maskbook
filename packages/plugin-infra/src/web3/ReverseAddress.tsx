import { memo } from 'react'
import type { NetworkPluginID } from '../web3-types'
import { useReverseAddress } from '../hooks'
import { useWeb3State } from './useWeb3State'

interface ReverseAddressProps {
    address: string
    pluginId?: NetworkPluginID
}

export const ReverseAddress = memo<ReverseAddressProps>(({ address, pluginId }) => {
    const { value: domain } = useReverseAddress(address, pluginId)
    const { Utils } = useWeb3State(pluginId)

    if (!domain || !Utils?.formatDomainName) return null

    return <>{Utils.formatDomainName(domain)}</>
})
