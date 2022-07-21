import { useAsync } from 'react-use'
import Services from '../../../../service'
import { getSiteType } from '@masknet/shared-base'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

export function useConnected() {
    const { value } = useAsync(async () => {
        const { url } = await Services.Helper.queryCurrentActiveTab()
        const siteType = getSiteType(url)

        if (!siteType) return false
        return WalletRPC.getConnectedStatus(siteType)
    }, [])

    return value
}
