import Services from '../../../../service.js'
import { getSiteType } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import { useQuery } from '@tanstack/react-query'

export function useConnected() {
    return useQuery(['connected-status'], async () => {
        const result = await Services.Helper.queryCurrentActiveTab()
        if (!result) return { connected: false, url: '' }
        const { url } = result
        const siteType = getSiteType(url)

        if (!siteType) return { connected: false, url }
        const connected = await WalletRPC.getConnectedStatus(siteType)
        return {
            connected,
            url,
        }
    })
}
