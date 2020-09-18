import WalletConnect from '@walletconnect/client'
import { useAsync } from 'react-use'

export function useWalletConnectURI() {
    const connector = new WalletConnect({
        bridge: 'https://bridge.walletconnect.org',
    })

    return useAsync(async () => {
        await connector.createSession()
        return connector.uri
    })
}
