export function saveAsFileFromUrl(url: string, fileName = '') {
    browser.downloads.download({
        url,
        filename: fileName,
        saveAs: true,
    })
}

export function saveAsFileFromBuffer(file: BufferSource, mimeType: string, fileName = '') {
    const blob = new Blob([file], { type: mimeType })
    const url = URL.createObjectURL(blob)
    saveAsFileFromUrl(url, fileName)
}
