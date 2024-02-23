import type { MimeType } from '@masknet/shared-base'

export function saveFileFromUrl(url: string, fileName: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = fileName
    a.click()
}
interface SaveFileOptions {
    fileContent: BufferSource
    fileName: string
    mimeType: string | MimeType
}
export async function saveFileFromBuffer(options: SaveFileOptions) {
    const blob = new Blob([options.fileContent], { type: options.mimeType })
    const url = URL.createObjectURL(blob)
    saveFileFromUrl(url, options.fileName)
}
