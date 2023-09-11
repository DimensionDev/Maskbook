import { type BridgeAPI } from '@masknet/sdk'
import { SignType } from '@masknet/shared-base'
import Services from '#services'
import { SiteMethods } from './site_context.js'
import { eth_request } from './eth.js'

export const maskSDKServer: BridgeAPI = {
    async persona_signMessage(message) {
        return Services.Identity.signWithPersona(SignType.Message, String(message))
    },
    eth_request,
    async reload() {
        if (process.env.NODE_ENV === 'production') return
        await Services.SiteAdaptor.attachMaskSDKToCurrentActivePage()
    },
    ...SiteMethods,
}
