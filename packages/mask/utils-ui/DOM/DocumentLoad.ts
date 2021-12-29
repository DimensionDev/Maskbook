export function untilDomLoaded() {
    if (document.readyState !== 'loading') return Promise.resolve()
    return new Promise<void>((resolve) => {
        const callback = () => {
            if (document.readyState !== 'loading') {
                resolve()
                document.removeEventListener('readystatechange', callback)
            }
        }
        document.addEventListener('readystatechange', callback, { passive: true })
    })
}

export function untilDocumentReady() {
    if (document.readyState === 'complete') return Promise.resolve()
    return new Promise<void>((resolve) => {
        const callback = () => {
            if (document.readyState === 'complete') {
                resolve()
                document.removeEventListener('readystatechange', callback)
            }
        }
        document.addEventListener('readystatechange', callback, { passive: true })
    })
}
