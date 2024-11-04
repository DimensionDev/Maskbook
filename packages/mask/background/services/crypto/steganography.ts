import { memoize } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { steganographyEncodeImage as __steganographyEncodeImage, type EncodeImageOptions } from '@masknet/encryption'

async function fetchImage(url: string) {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed.')
    return res.arrayBuffer()
}

const steganographyDownloadImage = memoizePromise(memoize, fetchImage, (x) => x)

export function steganographyEncodeImage(
    buf: ArrayLike<number> | ArrayBufferLike,
    options: Omit<EncodeImageOptions, 'downloadImage'>,
): Promise<Uint8Array> {
    return __steganographyEncodeImage(buf, { ...options, downloadImage: steganographyDownloadImage })
}
