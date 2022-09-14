import { contentScript } from './bridge.js'
export const persona: Mask.Persona = {
    __experimental__sign__(message, style) {
        if (style !== 'web3') throw new TypeError('Unsupported persona sign style. Supported style: web3')

        return contentScript.persona_sign_web3(message)
    },
}
