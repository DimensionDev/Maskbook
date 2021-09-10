import type { BridgeAPI } from '@masknet/sdk'
import Services from '../../service'

export const maskSDKServer: BridgeAPI = {
    async persona_sign_web3(message) {
        const result = await Services.Identity.signWithPersona({ message: String(message), method: 'eth' })
        return result.signature.signature
    },
}
