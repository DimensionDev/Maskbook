import { AsyncCall, MessageCenter } from '@holoflows/kit/es'
import { CryptoKeyRecord } from '../../key-management/db'
import { encodeText } from '../../utils/EncodeDecode'

if (location.protocol !== 'chrome-extension:') {
    throw new TypeError('BackgroundService run in wrong context. (Should be chrome-extension:)')
}
async function backupMyKeyPair(keyRecord: CryptoKeyRecord) {
    const string = JSON.stringify(keyRecord)
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
const BackgroundServices = {
    backupMyKeyPair: backupMyKeyPair,
}
export type Background = typeof BackgroundServices
AsyncCall<Background, {}>('bgs', BackgroundServices, {}, MessageCenter, true)
