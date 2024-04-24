import type { BridgeAPI } from '@masknet/sdk'
import Services from '#services'
import { eth_request } from './eth.js'

export const maskSDKServer: BridgeAPI = {
    eth_request,
    async reload() {
        if (process.env.NODE_ENV === 'production') return
        await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
    },
}
