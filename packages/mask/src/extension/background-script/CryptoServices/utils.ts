import { blobToArrayBuffer, memoizePromise } from '@dimensiondev/kit'
import { downloadUrl } from '../../../utils/utils'

export const steganographyDownloadImage = memoizePromise(
    async (url: string) => blobToArrayBuffer(await downloadUrl(url)),
    void 0,
)
