import { CryptoKeyRecord } from '../../key-management/db'

export async function SaveKeypair(keyRecord: CryptoKeyRecord) {
    const string = JSON.stringify(keyRecord)
    const buffer = new TextEncoder().encode(string)
    const blob = new Blob([buffer], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const today = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
    chrome.downloads.download(
        { url, filename: `maskbook-keystore-backup-${today}.json`, conflictAction: 'prompt', saveAs: true },
        downloadId => {},
    )
}
