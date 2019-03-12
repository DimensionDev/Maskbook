import { MessageCenter } from '../../utils/messages'

MessageCenter.on('requireSaveKeypair', key => {
    const k = JSON.stringify(key)
    const buf = new TextEncoder().encode(k)
    const blob = new Blob([buf], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const date = new Date()
    const dateStr = date.getFullYear() + '' + (date.getMonth() + 1) + '' + date.getDate()
    chrome.downloads.download(
        { url, filename: `maskbook-keystore-backup-${dateStr}.json`, conflictAction: 'prompt' },
        downloadId => {},
    )
})
