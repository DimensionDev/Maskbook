import { createMaskSDKServer } from '@masknet/sdk'
import Services from '../service'
import './hmr'

const maskSDK = createMaskSDKServer({
    async persona_sign_web3(message) {
        const result = await Services.Identity.signWithPersona({ message: String(message), method: 'eth' })
        return result.signature.signature
    },
})
