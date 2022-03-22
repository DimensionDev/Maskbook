import { memoizePromise } from '@dimensiondev/kit'
import { steganographyEncodeImage as __steganographyEncodeImage, EncodeImageOptions } from '@masknet/encryption'

async function fetchImage(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed.')
    return res.arrayBuffer()
}
const steganographyDownloadImage = memoizePromise(fetchImage, (x) => x)
export function steganographyEncodeImage(
    buf: ArrayBuffer,
    options: Omit<EncodeImageOptions, 'downloadImage'>,
): Promise<Uint8Array> {
    return __steganographyEncodeImage(buf, { ...options, downloadImage: steganographyDownloadImage })
}
