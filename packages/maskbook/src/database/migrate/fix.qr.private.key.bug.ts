import { setStorage } from '../../utils/browser.storage'
import { queryPersonasWithPrivateKey } from '../Persona/Persona.db'
import { deletePersona } from '../Persona/helpers'

/**
 * There is a bug that when use QR to import key, the private ket lost its secret.
 * If the JsonWebKey has no "d" field, remove the key and set mask as not setup.
 *
 * remove this after Mar 1 2020
 */
export default async function () {
    const ids = await queryPersonasWithPrivateKey()
    let hasBug = false
    for (const id of ids) {
        const key = id.privateKey
        if (!key.d) {
            deletePersona(id.identifier, 'delete even with private').catch(() => {})
            hasBug = true
        }
    }

    if (hasBug) {
        setStorage('facebook.com', { forceDisplayWelcome: true, userIgnoredWelcome: false })
        setStorage('twitter.com', { forceDisplayWelcome: true, userIgnoredWelcome: false })
    }
}
