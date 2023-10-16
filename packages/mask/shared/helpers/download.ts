import type { MimeType } from '@masknet/shared-base'

// TODO: maybe fallback to normal HTML save file?
export async function saveFileFromUrl(url: string, fileName: string) {
    await browser.downloads.download({ url, filename: fileName, saveAs: true })
}
interface SaveFileOptions {
    fileContent: BufferSource
    fileName: string
    mimeType: string | MimeType
}
export async function saveFileFromBuffer(options: SaveFileOptions) {
    const blob = new Blob([options.fileContent], { type: options.mimeType })
    const url = URL.createObjectURL(blob)
    await browser.downloads.download({ url, filename: options.fileName, saveAs: true })
}
