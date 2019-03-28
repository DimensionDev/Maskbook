import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit'
import { CryptoKeyRecord, getMyPrivateKey, toStoreCryptoKey } from '../../key-management/keystore-db'
import { encodeText } from '../../utils/EncodeDecode'
import { BackgroundName } from '../../utils/Names'
import { getMyLocalKey } from '../../key-management/local-db'

OnlyRunInContext('background', 'BackgroundService')
async function backupMyKeyPair() {
    const key = await getMyPrivateKey()
    const localKey = await crypto.subtle.exportKey('jwk', (await getMyLocalKey()).key)
    if (!key) throw new TypeError('You have no private key yet')
    const keyRecord: CryptoKeyRecord = await toStoreCryptoKey(key)
    const string = JSON.stringify({ key: keyRecord, local: localKey })
    const buffer = encodeText(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
    chrome.downloads.download(
        { url, filename: `maskbook-keystore-backup-${today}.json`, conflictAction: 'prompt', saveAs: true },
        downloadId => {},
    )
}
const Impl = {
    backupMyKeyPair: backupMyKeyPair,
}
Object.assign(window, { backgroundService: Impl })
export type Background = typeof Impl
AsyncCall<Background, {}>(BackgroundName, Impl, {}, MessageCenter, true)
