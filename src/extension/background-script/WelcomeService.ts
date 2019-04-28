import { OnlyRunInContext } from '@holoflows/kit'
import { CryptoKeyRecord, getMyPrivateKey, toStoreCryptoKey } from '../../key-management/keystore-db'
import { encodeText } from '../../utils/type-transform/EncodeDecode'
import { getMyLocalKey } from '../../key-management/local-db'
import { sleep } from '../../utils/utils'

OnlyRunInContext('background', 'WelcomeService')
export async function backupMyKeyPair() {
    // Don't make the download pop so fast
    await sleep(1000)
    const key = await getMyPrivateKey()
    const localKey = await crypto.subtle.exportKey('jwk', (await getMyLocalKey()).key)
    if (!key) throw new TypeError('You have no private key yet')
    const keyRecord: CryptoKeyRecord = await toStoreCryptoKey(key)
    const string = JSON.stringify({ key: keyRecord, local: localKey })
    const buffer = encodeText(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    browser.downloads.download({
        url,
        filename: `maskbook-keystore-backup-${today}.json`,
        conflictAction: 'prompt',
        saveAs: true,
    })
}
