export {}
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
    Object.defineProperty(File.prototype, 'arrayBuffer', {
        configurable: true,
        writable: true,
        value: toArrayBuffer,
    })
}

function toArrayBuffer(this: File) {
    return new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('abort', reject)
        reader.addEventListener('error', reject)
        reader.addEventListener('load', () => {
            const result = reader.result as ArrayBuffer
            if (typeof result === 'string') reject(new TypeError())
            resolve(result)
        })
        reader.readAsArrayBuffer(this)
    })
}
