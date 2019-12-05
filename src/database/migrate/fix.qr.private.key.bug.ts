import { getMyIdentitiesDB, removeMyIdentityAtDB } from '../people'
import { CryptoKeyToJsonWebKey } from '../../utils/type-transform/CryptoKey-JsonWebKey'
import { setStorage } from '../../utils/browser.storage'

/**
 * There is a bug that when use QR to import key, the private ket lost its secret.
 * If the JsonWebKey has no "d" field, remove the key and set maskbook as not setup.
 *
 * remove this after Mar 1 2020
 */
export default async function() {
    const ids = await getMyIdentitiesDB()
    let hasBug = false
    for (const id of ids) {
        const key = await CryptoKeyToJsonWebKey(id.privateKey)
        if (!key.d) {
            console.log('Key is broken')
            removeMyIdentityAtDB(id.identifier).catch(() => {})
            hasBug = true
        }
    }

    if (hasBug) {
        setStorage('facebook.com', { forceDisplayWelcome: true, userIgnoredWelcome: false })
        setStorage('twitter.com', { forceDisplayWelcome: true, userIgnoredWelcome: false })
    }
}
