import { getSiteType } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import Services from '../../../../service.js'

/**
 * Get source page from hash
 */
const getSourceUrl = () => {
    const search = location.hash.slice(location.hash.indexOf('?'))
    return new URLSearchParams(search).get('source') ?? ''
}

export function useConnected() {
    return useQuery(['connected-status'], async () => {
        const result = await Services.Helper.queryCurrentActiveTab()
        if (!result) return
        const url = result.url || getSourceUrl()
        const siteType = getSiteType(url)

        if (!siteType) return { connected: false, url }
        const connected = await Services.Wallet.getConnectedStatus(siteType)
        return {
            connected,
            url,
        }
    })
}
