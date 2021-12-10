// TODO: maybe fallback to normal HTML save file?
export async function saveFileFromUrl(url: string, fileName: string) {
    await browser.downloads.download({ url, filename: fileName, saveAs: true })
}

export async function saveFileFromBuffer(file: BufferSource, mimeType: string, fileName: string) {
    const blob = new Blob([file], { type: mimeType })
    const url = URL.createObjectURL(blob)
    await saveFileFromUrl(url, fileName)
}
