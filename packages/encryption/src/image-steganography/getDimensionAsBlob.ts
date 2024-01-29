import type { Dimension } from './presets.js'

export async function getDimensionAsBlob(file: Blob | string): Promise<Dimension | undefined> {
    if (typeof window === 'undefined' || typeof Image === 'undefined') return

    return new Promise<Dimension>((resolve, reject) => {
        const image = new Image()

        image.addEventListener(
            'load',
            () => {
                resolve({
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                })
            },
            {
                once: true,
                signal: AbortSignal.timeout(60 * 1000),
            },
        )
        image.addEventListener(
            'error',
            () => {
                reject(new Error('Failed to load image.'))
            },
            {
                once: true,
                signal: AbortSignal.timeout(60 * 1000),
            },
        )
        image.src = typeof file === 'string' ? file : URL.createObjectURL(file)
    })
}
