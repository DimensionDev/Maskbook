import { getSiteType } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import { WalletRPC } from '../../../../../plugins/WalletService/messages.js'
import Services from '../../../../service.js'

export function useConnected() {
    return useQuery(['connected-status'], async () => {
        const result = await Services.Helper.queryCurrentActiveTab()
        if (!result) return
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
