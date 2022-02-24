// Remove this file after iOS 14- is dropped.
try {
    if (typeof Blob === 'function') {
        if (!Blob.prototype.arrayBuffer) shim()
    }
    function shim() {
        // FileReader is not available in Worker on Safari
        if (typeof FileReader === 'undefined') throw new Error('FileReader is undefined')
        Blob.prototype.arrayBuffer = function () {
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.addEventListener('load', () => resolve(reader.result as ArrayBuffer))
                reader.addEventListener('error', () => reject(reader.error))
                reader.readAsArrayBuffer(this)
            })
        }
    }
} catch (err) {
    console.warn('Failed to polyfill Blob.prototype.arrayBuffer:', err)
}
export {}
