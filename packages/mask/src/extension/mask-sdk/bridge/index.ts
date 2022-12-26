import type { BridgeAPI } from '@masknet/sdk'
import Services from '../../service.js'
import { SNSMethods } from './sns_context.js'

export const maskSDKServer: BridgeAPI = {
    async persona_sign_web3(message) {
        const result = await Services.Identity.signWithPersona({
            method: 'personal',
            message: String(message),
        })
        return result.signature
    },
    ...SNSMethods,
}
