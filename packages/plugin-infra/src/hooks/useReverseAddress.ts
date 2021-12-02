import type { NetworkPluginID } from '../web3-types'
import { useWeb3State } from '../web3'
import { useAsync } from 'react-use'
import { useSubscription } from 'use-subscription'
import { noop } from 'lodash-unified'

export function useReverseAddress(address?: string, pluginId?: NetworkPluginID) {
    const { NameService, Shared } = useWeb3State(pluginId)

    const chainId = useSubscription(
        Shared?.chainId ?? {
            getCurrentValue: () => null,
            subscribe: () => noop,
        },
    )

    return useAsync(async () => {
        if (!address) return undefined
        return NameService?.reverse?.(address)
    }, [NameService, address, chainId])
}
