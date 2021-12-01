import { useWeb3State } from '../web3'
import { useAsync } from 'react-use'
import type { NetworkPluginID } from '../web3-types'
import { useSubscription } from 'use-subscription'
import { noop } from 'lodash-unified'

export function useLookupAddress(domain: string, pluginId?: NetworkPluginID) {
    const { NameService, Utils, Shared } = useWeb3State(pluginId)

    const chainId = useSubscription(
        Shared?.chainId ?? {
            getCurrentValue: () => null,
            subscribe: () => noop,
        },
    )

    return useAsync(async () => {
        if (NameService?.lookup && Utils?.isValidDomain?.(domain)) {
            return NameService.lookup(domain)
        }
        return ''
    }, [NameService, Utils, domain, chainId])
}
