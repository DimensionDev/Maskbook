import type { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext } from '@masknet/web3-hooks-base'
import { EVMWeb3, LensV3 } from '@masknet/web3-providers'
import { useMemo } from 'react'

export function useLensClient() {
    const { account } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    return useMemo(() => {
        return new LensV3(account, (message) => EVMWeb3.signMessage('message', message))
    }, [account])
}
