import { contentScript } from './bridge'
export const persona: Mask.Persona = {
    __experimental__sign__(message, style) {
        if (style !== 'web3') throw new TypeError('Unsupported persona signautre style. Supported style: web3')

        return contentScript.persona_sign_web3(message)
    },
}
