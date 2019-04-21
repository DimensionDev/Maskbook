import { AsyncCall, OnlyRunInContext } from '@holoflows/kit'
import { CryptoKeyRecord, getMyPrivateKey, toStoreCryptoKey } from '../../key-management/keystore-db'
import { encodeText } from '../../utils/type-transform/EncodeDecode'
import { BackgroundName } from '../../utils/constants'
import { getMyLocalKey } from '../../key-management/local-db'
import { sleep } from '../../utils/utils'

OnlyRunInContext('background', 'BackgroundService')
async function backupMyKeyPair() {
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
    chrome.downloads.download(
        { url, filename: `maskbook-keystore-backup-${today}.json`, conflictAction: 'prompt', saveAs: true },
        downloadId => {},
    )
}
async function logInBackground(...args: any[]) {
    console.log(...args)
}
const Impl = {
    backupMyKeyPair,
    logInBackground,
}
Object.assign(window, { backgroundService: Impl })
export type Background = typeof Impl
AsyncCall(Impl, { key: BackgroundName })
