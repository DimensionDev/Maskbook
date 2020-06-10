export function fetch(url: string) {
    return globalThis.fetch(url).then((x) => x.arrayBuffer())
}

export function saveAsFile(file: ArrayBuffer, mineType: string, suggestingFileName: string) {
    const blob = new Blob([file], { type: mineType })
    const url = URL.createObjectURL(blob)
    return browser.downloads.download({
        url,
        filename: suggestingFileName,
        saveAs: true,
    })
}
