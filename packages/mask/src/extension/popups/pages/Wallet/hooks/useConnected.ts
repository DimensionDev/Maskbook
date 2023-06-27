import { useAsync } from 'react-use'
import Services from '../../../../service.js'
import { getSiteType } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'

export function useConnected() {
    const { value = { connected: false, url: '' } } = useAsync(async () => {
        const { url } = await Services.Helper.queryCurrentActiveTab()
        const siteType = getSiteType(url)

        if (!siteType) return { connected: false, url }
        const connected = await WalletRPC.getConnectedStatus(siteType)
        return {
            connected,
            url,
        }
    }, [])

    return value
}
