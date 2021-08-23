import { useEffect, useState } from 'react'
import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import { WalletMessages } from '@masknet/plugin-wallet'

export function useCustomNetworks() {
    const [flag, setFlag] = useState(false)

    // update networks by message center
    useEffect(() => WalletMessages.events.customNetworkUpdated.on(() => setFlag((x) => !x)), [setFlag])

    return useAsyncRetry(async () => {
        return WalletRPC.getCustomNetworks()
    }, [status, flag])
}
