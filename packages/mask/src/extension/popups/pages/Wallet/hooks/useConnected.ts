import { getSiteType } from '@masknet/shared-base'
import { useQuery } from '@tanstack/react-query'
import Services from '../../../../service.js'
import { useSearchParams } from 'react-router-dom'

export function useConnected() {
    const [params] = useSearchParams()
    const source = params.get('source') ?? ''
    return useQuery(['connected-status', source], async () => {
        const result = await Services.Helper.queryCurrentActiveTab()
        if (!result) return
        const url = result.url || source
        const siteType = getSiteType(url)

        if (!siteType) return { connected: false, url }
        const connected = await Services.Wallet.getConnectedStatus(siteType)
        return {
            connected,
            url,
        }
    })
}
