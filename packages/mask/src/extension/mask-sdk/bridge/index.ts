import type { BridgeAPI } from '@masknet/sdk'
import { SignType } from '@masknet/shared-base'
import Services from '../../service.js'
import { SNSMethods } from './sns_context.js'

export const maskSDKServer: BridgeAPI = {
    async persona_sign_web3(message) {
        return Services.Identity.signWithPersona(SignType.Message, String(message))
    },
    ...SNSMethods,
}
