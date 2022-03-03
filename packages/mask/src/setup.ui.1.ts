import Services from './extension/service'

try {
    const old = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')!

    const originalToBlob = new Map<string, Promise<string> | string>()
    const blobToOriginal = new Map<string, string>()
    Object.defineProperty(HTMLImageElement.prototype, 'src', {
        configurable: true,
        enumerable: old.enumerable,
        get() {
            const orig = old.get!.call(this)
            return blobToOriginal.get(orig) || orig
        },
        set(value) {
            value = String(value)
            if (value.startsWith('http')) {
                if (!originalToBlob.has(value)) {
                    originalToBlob.set(value, Services.Helper.fetch(value).then(URL.createObjectURL))
                }
                Promise.resolve(originalToBlob.get(value))
                    .catch(() => value)
                    .then((url) => {
                        old.set!.call(this, url)
                        blobToOriginal.set(value, url)
                    })
            } else old.set!.call(this, value)
        },
    })
} catch {}
